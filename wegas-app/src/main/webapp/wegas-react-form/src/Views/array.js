import React, { PropTypes } from 'react';
import IconButton from 'material-ui/IconButton';

const minusStyle = {
    float: 'left',
    marginTop: '12px'
};
const childStyle = {
    marginLeft: '48px'
};
const legendStyle = {
    textAlign: 'center'
};
function ArrayWidget(props) {
    function renderChild(child, index) {
        return (<div style={{ clear: 'both' }}>
            <IconButton
                style={minusStyle}
                iconClassName="fa fa-minus"
                onClick={props.onChildRemove(index)}
            />
            <div style={childStyle}>{child}</div>
        </div>);
    }

    const style = {
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingLeft: '3px',
        borderTop: props.view.label ? '1px solid lightgrey' : 'none'
    };
    const children = React.Children.map(props.children, renderChild);
    return (<fieldset
        className={props.view.className}
        style={style}
    >
        <legend style={legendStyle}>
            {props.view.label || props.editKey}
        </legend>
        {children}
        <IconButton
            iconClassName="fa fa-plus"
            onClick={props.onChildAdd}
        />
    </fieldset>);
}

ArrayWidget.propTypes = {
    children: PropTypes.arrayOf(PropTypes.element),
    onChildRemove: PropTypes.func.isRequired,
    onChildAdd: PropTypes.func.isRequired,
    view: PropTypes.object,
    editKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};
export default ArrayWidget;
