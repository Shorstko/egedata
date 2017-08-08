function addMyWebPart(wpCategory, wpTitle) {
    var webPartAdder = SP.Ribbon.WebPartComponent.getWebPartAdder();
    var webPart = findWebPart(webPartAdder, wpCategory, wpTitle);
    if (webPart) {
        var wpid = webPartAdder._createWebpartPlaceholderInRte(RTE.Cursor.get_range());
        webPartAdder.addItemToPageByItemIdAndZoneId(webPart.id, 'wpz', 0, wpid);
    }
    else
        alert('"' + wpTitle + '" web part not found!');
}
function findWebPart(webPartAdder, category, wpTitle) {
    if (webPartAdder) {
        var wpCategory = findByTitle(webPartAdder._cats, category);
        if (wpCategory)
            return findByTitle(wpCategory.items, wpTitle);
    }
}
function findByTitle(list, title) {
    for (i = 0; i < list.length; i++) {
        var item = list[i];
        if (item.title == title)
            return item;
    }
}