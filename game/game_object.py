from uuid import uuid4

class GameObject():
    def __init__(self, id=uuid4()):
        """
        Initializes a new game object with an id
        """
        self._id = id

    def validate(self):
        """
        Meant to be implemented in subclasses. Used to coordinate and
        validate state with other objects
        """
        raise Exception("Not validated yet")

    @property
    def id(self):
        """
        Game object id is read only
        """
        return self._id
