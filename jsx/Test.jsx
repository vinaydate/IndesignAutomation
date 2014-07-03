function placeData(data) {
    'use strict';
    alert(data);
    app.documents[0].pages[0].textFrames[0].contents = data;
}
