from abc import ABC
from typing import Callable

from django.core.exceptions import ValidationError


def validate_action_exists(name: str):
    if name not in ActionManager().actions:
        raise ValidationError(f"Couldn't find action {name}!")


def register(function, name=None):
    if name is None:
        name = function.__name__
    ActionManager().register_action(name, function)


class ActionManager(object):
    _instance = None
    __actions: dict[str, Callable]

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(ActionManager, cls).__new__(cls)
            cls.__actions = {}
        return cls._instance

    def register_action(self, name: str, action: Callable):
        if name in self.__actions:
            raise RuntimeError("Unable to re-register same name!")
        else:
            self.__actions[name] = action

    def execute_action(self, name: str, *args, **kwargs):
        if name not in self.__actions:
            raise ValueError(f"Action called {name} not found!")
        self.__actions[name](*args, **kwargs)

    @property
    def actions(self):
        return self.__actions
