from abc import ABC

from django.core.exceptions import ValidationError


def validate_action_exists(name: str):
    if name not in ActionManager().actions:
        raise ValidationError(f"Couldn't find action {name}!")


class ActionManager(object):
    _instance = None
    __actions: dict[str, 'Action']

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(ActionManager, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        self.__actions = {}

    def register_action(self, name: str, action: 'Action'):
        if name in self.__actions:
            raise RuntimeError("Unable to re-register same name!")
        else:
            self.__actions[name] = action

    def execute_action(self, name: str, *args, **kwargs):
        if name not in self.__actions:
            raise ValueError(f"Action called {name} not found!")
        self.__actions[name].execute(*args, **kwargs)

    @property
    def actions(self):
        return self.__actions


class Action(ABC):
    def __init__(self, *args, **kwargs):
        pass

    def execute(self, *args, **kwargs):
        pass
