function _positionStickySupported() {
    const el = document.createElement('a');
    const mStyle = el.style;

    mStyle.cssText = 'position:sticky; position:-webkit-sticky;';
    return mStyle.position.indexOf('sticky') !== -1;
}

export const positionStickySupported = _positionStickySupported();
