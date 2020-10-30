import json
from typing import Optional

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.db.models.query import QuerySet

from djangorestframework_camel_case.util import camelize
#    def receive(self, text_data):
#        self.send(text_data=text_data)
from roulette.models import Match, Request, StudentRequest, TutorRequest
from django.db.models import F
from roulette.serializers import MatchSerializer


class RouletteConsumer(WebsocketConsumer):

    def connect(self):
        user = self.scope["user"]
        request_id: str = self.scope["url_route"]["kwargs"]["request_id"]
        request_type: str = self.scope["url_route"]["kwargs"]["type"]
        request_query: Optional[QuerySet] = None
        if request_type == "tutor":
            request_query = TutorRequest.objects.filter(
                id=request_id, user=user, is_active=True)
        elif request_type == "student":
            request_query = StudentRequest.objects.filter(
                id=request_id, user=user, is_active=True)
        if request_query:
            self.request: Request = request_query.get()
            self.request.connected_count = F('connected_count') + 1
            self.request.save()
            self.request_group_name = f"request_{request_type}_{request_id}"
            async_to_sync(self.channel_layer.group_add)(
                self.request_group_name, self.channel_name)
            self.accept()
            if hasattr(self.request, 'match'):
                self.roulette_new_match({
                    "match": self.request.match.id
                })
            if self.request.meeting:
                self.roulette_meeting_ready({
                    "meetingID": str(self.request.meeting.meeting_id)
                })
        else:
            self.close()

    def disconnect(self, code):
        if hasattr(self, "request_group_name"):
            async_to_sync(self.channel_layer.group_discard)(
                self.request_group_name,
                self.channel_name
            )
            self.request.connected_count = F('connected_count') - 1
            self.request.save()

    def serialize_match(self, match_id):
        return camelize(MatchSerializer(Match.objects.get(id=match_id)).data)

    def roulette_new_match(self, event):
        self.send(json.dumps({
            "event": "newMatch",
            "match": self.serialize_match(event["match"])
        }))

    def roulette_match_update(self, event):
        self.send(json.dumps({
            "event": "matchUpdate",
            "match": self.serialize_match(event["match"])
        }))

    def roulette_match_delete(self, event):
        self.send(json.dumps({
            "event": "matchDelete",
            "reason": event["reason"]
        }))

    def roulette_meeting_ready(self, event):
        self.send(json.dumps({
            "event": "meetingReady",
            "meetingID": event["meetingID"]
        }))
