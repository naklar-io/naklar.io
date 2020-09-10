import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.db.models.query import QuerySet

#    def receive(self, text_data):
#        self.send(text_data=text_data)
from roulette.models import Request, StudentRequest, TutorRequest


class RouletteConsumer(WebsocketConsumer):

    def connect(self):
        request_id: str = self.scope["url_route"]["kwargs"]["request_id"]
        request_type: str = self.scope["url_route"]["kwargs"]["type"]
        request_query: QuerySet = None
        if request_type == "tutor":
            request_query = TutorRequest.objects.filter(id=request_id)
        elif request_type == "student":
            request_query = StudentRequest.objects.filter(id=request_id)
        if request_query:
            request: Request = request_query.get()
            self.request_group_name = f"request_{request_type}_{request_id}"
            async_to_sync(self.channel_layer.group_add)(self.request_group_name, self.channel_name)
            self.accept()
        else:
            self.close()

    def disconnect(self, code):
        if hasattr(self, "request_group_name"):
            async_to_sync(self.channel_layer.group_discard)(
                self.request_group_name,
                self.channel_name
            )

    def receive(self, text_data):
        print("Received")

    def roulette_new_match(self, event):
        self.send(json.dumps(event))