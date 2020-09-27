from dataclasses import dataclass
from django.contrib.auth import get_user_model


@dataclass
class RouletteStatistics:
    meeting_count: int
    meeting_minutes: int
    average_rating: float


@dataclass
class RouletteStatisticsOverview:
    tutor_statistics: RouletteStatistics
    student_statistics: RouletteStatistics

    @staticmethod
    def load_from_model(user_id: int):
        user = get_user_model().objects.get(pk=user_id)
        # TODO: Fetch required data, create statistics and return instance of RouletteStatisticsOverview