export let widgetState = {
    isSuggestionWidgetVisible: false
};

export function setVisibilityWidget(a){
    widgetState.isSuggestionWidgetVisible = a;
}

export function getWidgetVisibility(){
    return widgetState.isSuggestionWidgetVisible;
}