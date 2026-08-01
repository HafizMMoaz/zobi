# pylint: disable=import-outside-toplevel


def register_sqla_event_listeners() -> None:
    import sqlalchemy as sqla

    from zobi.connectors.sqla.models import SqlaTable
    from zobi.models.core import FavStar
    from zobi.models.dashboard import Dashboard
    from zobi.models.slice import Slice
    from zobi.models.sql_lab import SavedQuery
    from zobi.tags.models import (
        ChartUpdater,
        DashboardUpdater,
        DatasetUpdater,
        FavStarUpdater,
        QueryUpdater,
    )

    sqla.event.listen(SqlaTable, "after_insert", DatasetUpdater.after_insert)
    sqla.event.listen(SqlaTable, "after_update", DatasetUpdater.after_update)
    sqla.event.listen(SqlaTable, "after_delete", DatasetUpdater.after_delete)

    sqla.event.listen(Slice, "after_insert", ChartUpdater.after_insert)
    sqla.event.listen(Slice, "after_update", ChartUpdater.after_update)
    sqla.event.listen(Slice, "after_delete", ChartUpdater.after_delete)

    sqla.event.listen(Dashboard, "after_insert", DashboardUpdater.after_insert)
    sqla.event.listen(Dashboard, "after_update", DashboardUpdater.after_update)
    sqla.event.listen(Dashboard, "after_delete", DashboardUpdater.after_delete)

    sqla.event.listen(FavStar, "after_insert", FavStarUpdater.after_insert)
    sqla.event.listen(FavStar, "after_delete", FavStarUpdater.after_delete)

    sqla.event.listen(SavedQuery, "after_insert", QueryUpdater.after_insert)
    sqla.event.listen(SavedQuery, "after_update", QueryUpdater.after_update)
    sqla.event.listen(SavedQuery, "after_delete", QueryUpdater.after_delete)


def clear_sqla_event_listeners() -> None:
    import sqlalchemy as sqla

    from zobi.connectors.sqla.models import SqlaTable
    from zobi.models.core import FavStar
    from zobi.models.dashboard import Dashboard
    from zobi.models.slice import Slice
    from zobi.models.sql_lab import SavedQuery
    from zobi.tags.models import (
        ChartUpdater,
        DashboardUpdater,
        DatasetUpdater,
        FavStarUpdater,
        QueryUpdater,
    )

    sqla.event.remove(SqlaTable, "after_insert", DatasetUpdater.after_insert)
    sqla.event.remove(SqlaTable, "after_update", DatasetUpdater.after_update)
    sqla.event.remove(SqlaTable, "after_delete", DatasetUpdater.after_delete)

    sqla.event.remove(Slice, "after_insert", ChartUpdater.after_insert)
    sqla.event.remove(Slice, "after_update", ChartUpdater.after_update)
    sqla.event.remove(Slice, "after_delete", ChartUpdater.after_delete)

    sqla.event.remove(Dashboard, "after_insert", DashboardUpdater.after_insert)
    sqla.event.remove(Dashboard, "after_update", DashboardUpdater.after_update)
    sqla.event.remove(Dashboard, "after_delete", DashboardUpdater.after_delete)

    sqla.event.remove(FavStar, "after_insert", FavStarUpdater.after_insert)
    sqla.event.remove(FavStar, "after_delete", FavStarUpdater.after_delete)

    sqla.event.remove(SavedQuery, "after_insert", QueryUpdater.after_insert)
    sqla.event.remove(SavedQuery, "after_update", QueryUpdater.after_update)
    sqla.event.remove(SavedQuery, "after_delete", QueryUpdater.after_delete)
