from collections import defaultdict

from zobi import security_manager
from zobi.utils.decorators import transaction


@transaction()
def cleanup_permissions() -> None:
    # 1. Clean up duplicates.
    pvms = security_manager.get_session.query(
        security_manager.permissionview_model
    ).all()
    print(f"# of permission view menus is: {len(pvms)}")
    pvms_dict = defaultdict(list)
    for pvm in pvms:
        pvms_dict[(pvm.permission, pvm.view_menu)].append(pvm)
    duplicates = [v for v in pvms_dict.values() if len(v) > 1]

    for pvm_list in duplicates:
        first_prm = pvm_list[0]
        roles = set(first_prm.role)
        for pvm in pvm_list[1:]:
            roles = roles.union(pvm.role)
            security_manager.get_session.delete(pvm)
        first_prm.roles = list(roles)

    pvms = security_manager.get_session.query(
        security_manager.permissionview_model
    ).all()
    print(f"Stage 1: # of permission view menus is: {len(pvms)}")

    # 2. Clean up None permissions or view menus
    pvms = security_manager.get_session.query(
        security_manager.permissionview_model
    ).all()
    for pvm in pvms:
        if not (pvm.view_menu and pvm.permission):
            security_manager.get_session.delete(pvm)

    pvms = security_manager.get_session.query(
        security_manager.permissionview_model
    ).all()
    print(f"Stage 2: # of permission view menus is: {len(pvms)}")

    # 3. Delete empty permission view menus from roles
    roles = security_manager.get_session.query(security_manager.role_model).all()
    for role in roles:
        role.permissions = [p for p in role.permissions if p]

    # 4. Delete empty roles from permission view menus
    pvms = security_manager.get_session.query(
        security_manager.permissionview_model
    ).all()
    for pvm in pvms:
        pvm.role = [r for r in pvm.role if r]


cleanup_permissions()
