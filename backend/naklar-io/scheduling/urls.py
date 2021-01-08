from rest_framework import routers

from scheduling.views import AvailableSlotViewSet, AppointmentViewSet, TimeSlotViewSet

app_name = 'scheduling'
router = routers.DefaultRouter()
router.register('available-slot', AvailableSlotViewSet, basename='availableslot')
router.register('appointment', AppointmentViewSet)
router.register('timeslot', TimeSlotViewSet)
urlpatterns = router.urls
