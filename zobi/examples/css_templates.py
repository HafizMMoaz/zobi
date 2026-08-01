import logging
import textwrap

from zobi import db
from zobi.models.core import CssTemplate

logger = logging.getLogger(__name__)


def load_css_templates() -> None:
    """Loads 2 css templates to demonstrate the feature"""
    logger.debug("Creating default CSS templates")

    obj = db.session.query(CssTemplate).filter_by(template_name="Flat").first()
    if not obj:
        obj = CssTemplate(template_name="Flat")
        db.session.add(obj)
    css = textwrap.dedent(
        """\
    .navbar {
        transition: opacity 0.5s ease;
        opacity: 0.05;
    }
    .navbar:hover {
        opacity: 1;
    }
    .chart-header .header{
        font-weight: @font-weight-normal;
        font-size: 12px;
    }
    /*
    var bnbColors = [
        //rausch    hackb      kazan      babu      lima        beach     tirol
        '#ff5a5f', '#7b0051', '#007A87', '#00d1c1', '#8ce071', '#ffb400', '#b4a76c',
        '#ff8083', '#cc0086', '#00a1b3', '#00ffeb', '#bbedab', '#ffd266', '#cbc29a',
        '#ff3339', '#ff1ab1', '#005c66', '#00b3a5', '#55d12e', '#b37e00', '#988b4e',
     ];
    */
    """
    )
    obj.css = css

    obj = db.session.query(CssTemplate).filter_by(template_name="Courier Black").first()
    if not obj:
        obj = CssTemplate(template_name="Courier Black")
        db.session.add(obj)
    css = textwrap.dedent(
        """\
    h2 {
        color: white;
        font-size: 52px;
    }
    .navbar {
        box-shadow: none;
    }
    .navbar {
        transition: opacity 0.5s ease;
        opacity: 0.05;
    }
    .navbar:hover {
        opacity: 1;
    }
    .chart-header .header{
        font-weight: @font-weight-normal;
        font-size: 12px;
    }
    .nvd3 text {
        font-size: 12px;
        font-family: inherit;
    }
    body{
        background: #000;
        font-family: Courier, Monaco, monospace;;
    }
    /*
    var bnbColors = [
        //rausch    hackb      kazan      babu      lima        beach     tirol
        '#ff5a5f', '#7b0051', '#007A87', '#00d1c1', '#8ce071', '#ffb400', '#b4a76c',
        '#ff8083', '#cc0086', '#00a1b3', '#00ffeb', '#bbedab', '#ffd266', '#cbc29a',
        '#ff3339', '#ff1ab1', '#005c66', '#00b3a5', '#55d12e', '#b37e00', '#988b4e',
     ];
    */
    """
    )
    obj.css = css
