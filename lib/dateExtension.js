Date.prototype.formatDate = function (date) {
    let myYear = date.getFullYear();
    let myMonth = date.getMonth() + 1;
    let myWeekDay = date.getDate();
    if (myMonth < 10) {
        myMonth = "0" + myMonth;
    }
    if (myWeekDay < 10) {
        myWeekDay = "0" + myWeekDay;
    }
    return (myYear + "-" + myMonth + "-" + myWeekDay);
}