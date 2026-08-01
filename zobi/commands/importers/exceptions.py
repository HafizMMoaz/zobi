
from zobi.commands.exceptions import CommandException


class IncorrectVersionError(CommandException):
    status = 422
    message = "Import has incorrect version"


class NoValidFilesFoundError(CommandException):
    status = 400
    message = "No valid import files were found"


class IncorrectFormatError(CommandException):
    status = 422
    message = "File has the incorrect format"
