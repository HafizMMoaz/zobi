from typing import Any

from zobi import security_manager


def get_test_user(id_: int, username: str) -> Any:
    """Create a sample test user"""
    return security_manager.user_model(
        id=id_,
        username=username,
        first_name=username,
        last_name=username,
        email=f"{username}@example.com",
    )
