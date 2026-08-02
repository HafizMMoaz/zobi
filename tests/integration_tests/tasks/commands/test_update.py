from uuid import UUID

import pytest
from zobi_core.tasks.types import TaskScope, TaskStatus

from zobi import db
from zobi.commands.tasks import UpdateTaskCommand
from zobi.commands.tasks.exceptions import (
    TaskForbiddenError,
    TaskNotFoundError,
)
from zobi.daos.tasks import TaskDAO


def test_update_task_success(app_context, get_user, login_as) -> None:
    """Test successful task update"""
    admin = get_user("admin")
    login_as("admin")

    # Create a task using DAO
    task = TaskDAO.create_task(
        task_type="test_type",
        task_key="update_test",
        scope=TaskScope.PRIVATE,
        user_id=admin.id,
    )
    task.created_by = admin
    task.set_status(TaskStatus.IN_PROGRESS)
    db.session.commit()

    try:
        # Update the task status
        command = UpdateTaskCommand(
            task_uuid=task.uuid,
            status=TaskStatus.SUCCESS.value,
        )
        result = command.run()

        # Verify update
        assert result.uuid == task.uuid
        assert result.status == TaskStatus.SUCCESS.value

        # Verify in database
        db.session.refresh(task)
        assert task.status == TaskStatus.SUCCESS.value
    finally:
        # Cleanup
        db.session.delete(task)
        db.session.commit()


def test_update_task_not_found(app_context, login_as) -> None:
    """Test update fails when task not found"""
    login_as("admin")

    command = UpdateTaskCommand(
        task_uuid=UUID("00000000-0000-0000-0000-000000000000"),
        status=TaskStatus.SUCCESS.value,
    )

    with pytest.raises(TaskNotFoundError):
        command.run()


def test_update_task_forbidden(app_context, get_user, login_as) -> None:
    """Test update fails when user doesn't own task (via base filter)"""
    gamma = get_user("gamma")
    login_as("gamma")

    # Create a task owned by gamma (non-admin) using DAO
    task = TaskDAO.create_task(
        task_type="test_type",
        task_key="forbidden_test",
        scope=TaskScope.PRIVATE,
        user_id=gamma.id,
    )
    task.created_by = gamma
    task.set_status(TaskStatus.IN_PROGRESS)
    db.session.commit()

    try:
        # Login as alpha user (different non-admin, non-owner)
        login_as("alpha")

        # Try to update gamma's task as alpha user
        command = UpdateTaskCommand(
            task_uuid=task.uuid,
            status=TaskStatus.SUCCESS.value,
        )

        # Should raise ForbiddenError because ownership check fails
        with pytest.raises(TaskForbiddenError):
            command.run()

        # Verify task was NOT updated
        db.session.refresh(task)
        assert task.status == TaskStatus.IN_PROGRESS.value
    finally:
        # Cleanup
        db.session.delete(task)
        db.session.commit()


def test_update_task_payload(app_context, get_user, login_as) -> None:
    """Test updating task payload"""
    admin = get_user("admin")
    login_as("admin")

    # Create a task using DAO
    task = TaskDAO.create_task(
        task_type="test_type",
        task_key="payload_test",
        scope=TaskScope.PRIVATE,
        user_id=admin.id,
        payload={"initial": "data"},
    )
    task.created_by = admin
    task.set_status(TaskStatus.IN_PROGRESS)
    db.session.commit()

    try:
        # Update payload
        command = UpdateTaskCommand(
            task_uuid=task.uuid,
            payload={"progress": 50, "message": "halfway"},
        )
        result = command.run()

        # Verify payload was updated
        assert result.uuid == task.uuid
        payload = result.payload_dict
        assert payload["progress"] == 50
        assert payload["message"] == "halfway"

        # Verify in database
        db.session.refresh(task)
        task_payload = task.payload_dict
        assert task_payload["progress"] == 50
    finally:
        # Cleanup
        db.session.delete(task)
        db.session.commit()


def test_update_all_supported_fields(app_context, get_user, login_as) -> None:
    """Test updating all supported task fields
    (status, error, progress, abortable, timeout)"""
    admin = get_user("admin")
    login_as("admin")

    # Create a task with initial execution_mode and timeout in properties
    task = TaskDAO.create_task(
        task_type="test_type",
        task_key="all_fields_test",
        scope=TaskScope.PRIVATE,
        user_id=admin.id,
        properties={"execution_mode": "async", "timeout": 300},
    )
    task.created_by = admin
    task.set_status(TaskStatus.IN_PROGRESS)
    db.session.commit()

    try:
        # Update all field types at once
        command = UpdateTaskCommand(
            task_uuid=task.uuid,
            status=TaskStatus.FAILURE.value,
            properties={
                "error_message": "Task failed due to error",
                "progress_percent": 0.75,
                "progress_current": 75,
                "progress_total": 100,
                "is_abortable": True,
            },
        )
        result = command.run()

        # Verify all fields were updated
        assert result.uuid == task.uuid
        assert result.status == TaskStatus.FAILURE.value
        assert result.properties_dict.get("error_message") == "Task failed due to error"
        assert result.properties_dict.get("progress_percent") == 0.75
        assert result.properties_dict.get("progress_current") == 75
        assert result.properties_dict.get("progress_total") == 100
        assert result.properties_dict.get("is_abortable") is True
        assert result.properties_dict.get("execution_mode") == "async"
        assert result.properties_dict.get("timeout") == 300

        # Verify in database
        db.session.refresh(task)
        assert task.status == TaskStatus.FAILURE.value
        assert task.properties_dict.get("error_message") == "Task failed due to error"
        assert task.properties_dict.get("progress_percent") == 0.75
        assert task.properties_dict.get("progress_current") == 75
        assert task.properties_dict.get("progress_total") == 100
        assert task.properties_dict.get("is_abortable") is True
        assert task.properties_dict.get("execution_mode") == "async"
        assert task.properties_dict.get("timeout") == 300
    finally:
        # Cleanup
        db.session.delete(task)
        db.session.commit()


def test_update_task_skip_security_check(app_context, get_user, login_as) -> None:
    """Test skip_security_check allows updating any task"""
    admin = get_user("admin")
    login_as("admin")

    # Create a task owned by admin
    task = TaskDAO.create_task(
        task_type="test_type",
        task_key="skip_security_test",
        scope=TaskScope.PRIVATE,
        user_id=admin.id,
    )
    task.created_by = admin
    task.set_status(TaskStatus.IN_PROGRESS)
    db.session.commit()

    try:
        # Login as gamma user (non-owner)
        login_as("gamma")

        # With skip_security_check=True, should succeed even though gamma doesn't own it
        command = UpdateTaskCommand(
            task_uuid=task.uuid,
            properties={"progress_percent": 0.75},
            skip_security_check=True,
        )
        result = command.run()

        # Verify update succeeded
        assert result.uuid == task.uuid
        assert result.properties_dict.get("progress_percent") == 0.75

        # Verify in database
        db.session.refresh(task)
        assert task.properties_dict.get("progress_percent") == 0.75
    finally:
        # Cleanup
        db.session.delete(task)
        db.session.commit()
