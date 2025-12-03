"""
Guardian API Exceptions
"""


class GuardianAPIException(Exception):
    """Base exception for Guardian API client errors"""
    pass


class GuardianAPIError(GuardianAPIException):
    """Exception raised for API errors (4xx, 5xx responses)"""
    
    def __init__(self, message: str, status_code: int = None, response=None):
        super().__init__(message)
        self.status_code = status_code
        self.response = response

