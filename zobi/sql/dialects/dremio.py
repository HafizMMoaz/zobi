from sqlglot import exp, generator, parser
from sqlglot.dialects.dialect import Dialect, rename_func


class DremioRegexpSplit(exp.Func):
    """
    Custom REGEXP_SPLIT function for Dremio that supports 4 arguments.
    """

    arg_types = {
        "this": True,  # string to split
        "expression": True,  # delimiter pattern
        "mode": True,  # mode (like 'ALL') - required in Dremio
        "limit": True,  # limit - required in Dremio
    }


class Dremio(Dialect):
    class Parser(parser.Parser):
        FUNCTIONS = {
            **parser.Parser.FUNCTIONS,
            "REGEXP_SPLIT": DremioRegexpSplit.from_arg_list,
        }

    class Generator(generator.Generator):
        TRANSFORMS = {
            **generator.Generator.TRANSFORMS,
            DremioRegexpSplit: rename_func("REGEXP_SPLIT"),
        }
