
function isNonFolderSelected() {
    var selectedItems = SP.ListOperation.Selection.getSelectedItems();
    var result = false;

    for (var i = 0; i < selectedItems.length; i++) {
        if (selectedItems[i].fsObjType == 0) {
            result = true;
            break;
        }
    }

    return result;
}

function openModalForm(urlSite, listId) {
    var ids = SP.ListOperation.Selection.getSelectedItems()[0].id;

    var options = {
        url: urlSite + "/_layouts/OpenLayersMap/UpdateItemCoordinats.aspx?ListId=" + listId + "&ItemID=" + ids,
        autoSize: true,
        allowMaximize: true,
        title: 'Привязка элемента к навигационной карте',
        showClose: true,
        dialogReturnValueCallback: function (dialogResult, returnValue) {
            if (dialogResult == SP.UI.DialogResult.OK) {
                SP.UI.ModalDialog.RefreshPage(1);
            }
        }
    };

    SP.UI.ModalDialog.showModalDialog(options);
   
}