"""Season choice shared by every card; current follows the calendar year."""
from datetime import datetime

CURRENT_SEASON = "current"
FIRST_SEASON = 2023


def season_choices():
    return [CURRENT_SEASON, *(str(year) for year in range(datetime.now().year, FIRST_SEASON - 1, -1))]


def selected_season(entry):
    choice = entry.options.get("season", CURRENT_SEASON)
    return datetime.now().year if choice == CURRENT_SEASON else int(choice)
