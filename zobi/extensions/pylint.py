from pathlib import Path

from astroid import nodes
from pylint.checkers import BaseChecker
from pylint.lint import PyLinter


class TransactionChecker(BaseChecker):
    name = "consider-using-transaction"
    msgs = {
        "W9001": (
            'Consider using the @transaction decorator when defining a "unit of work"',
            "consider-using-transaction",
            "Used when an explicit commit or rollback call is detected",
        ),
    }

    def visit_call(self, node: nodes.Call) -> None:
        if isinstance(node.func, nodes.Attribute):
            if node.func.attrname in ("commit", "rollback"):
                self.add_message("consider-using-transaction", node=node)


class SQLParsingLibraryImportChecker(BaseChecker):
    name = "disallowed-sql-import"
    priority = 0
    msgs = {
        "C9002": (
            "Disallowed SQL parsing import used",
            "disallowed-sql-import",
            "Used when a disallowed import is used in a specific file.",
        ),
    }

    def _is_disallowed(self, file_path: Path, root_mod: str) -> bool:
        # Never allow sqlparse/sqloxide
        if root_mod in {"sqlparse", "sqloxide"}:
            return True

        # Allow sqlglot inside zobi/sql and in the config
        allowed = {
            "**/zobi/sql/**/*.py",
            "**/zobi/sql/*.py",
            "**/zobi/config.py",
        }
        valid = any(file_path.match(pattern) for pattern in allowed)
        return root_mod == "sqlglot" and not valid

    def visit_import(self, node: nodes.Import) -> None:
        root_file = Path(node.root().file or "")
        for mod, _ in node.names:
            root_mod = mod.split(".", 1)[0]
            if self._is_disallowed(root_file, root_mod):
                self.add_message("disallowed-sql-import", node=node)

    def visit_importfrom(self, node: nodes.ImportFrom) -> None:
        root_file = Path(node.root().file or "")
        root_mod = (node.modname or "").split(".", 1)[0]
        if self._is_disallowed(root_file, root_mod):
            self.add_message("disallowed-sql-import", node=node)


def register(linter: PyLinter) -> None:
    linter.register_checker(SQLParsingLibraryImportChecker(linter))
    linter.register_checker(TransactionChecker(linter))
