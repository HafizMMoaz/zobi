"""
OpenSearch SQL dialect.

OpenSearch SQL is syntactically close to MySQL but accepts both backticks and
double-quotes as identifier delimiters.
"""

from __future__ import annotations

from sqlglot.dialects.mysql import MySQL


class OpenSearch(MySQL):
    class Tokenizer(MySQL.Tokenizer):
        IDENTIFIERS = ["`", '"']
