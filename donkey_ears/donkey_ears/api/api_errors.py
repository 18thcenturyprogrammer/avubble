# define Python user-defined exceptions
class Error(Exception):
    """Base class for other exceptions"""
    pass


class MoreThanTwoVoteError(Error):
    """one walletaddres can vote one"""
    pass

class NotFoundUserId(Error):
    """user id is not passed"""
    pass
