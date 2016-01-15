/**
 * Created by Torbein Rein, Øysten Gammersvik and Zahraa Masiavi on 08.11.13.
 */

/**
 * Returns today's date as an ISO string
 */
function getDateOfToday() {
    var date = new Date();
    strDate = date.toISOString().substr(0,10);
    return strDate;
}

/**
 * Returns the context path URL
 */
function getContextURLPath() {
    //var rootUrl = location.protocol;
    //rootUrl = rootUrl+"//"+location.host
    var xhReq = new XMLHttpRequest();
    xhReq.open("GET", "manifest.webapp", false);
    xhReq.send(null);
    var serverResponse = JSON.parse(xhReq.responseText);
    var dhisAPI = serverResponse.activities.dhis.href;

    //return rootUrl;
    return dhisAPI;
}
/**
 * Compares the date value of two objects
 */
function compareDate(a,b) {
    if (a.date < b.date)
        return -1;
    if (a.date > b.date)
        return 1;
    return 0;
}
/**
 * Does ajax call to get the data to populate the graph.
 * @param orgUnitId
 * @param personId
 */
function getWeightData(orgUnitId, personId){
    var eventArray = [];

  //$.getJSON(getContextURLPath() + "/api/events.json?orgUnit=" + orgUnitId + "&program=uy2gU8kT1jF&startDate=2012-01-01&endDate=" + getDateOfToday() + "&person=" + personId, function(json) {
   // $.getJSON("http://localhost:8082/api/events.json?orgUnit=" + orgUnitId + "&program=uy2gU8kT1jF&startDate=2012-01-01&endDate=" + getDateOfToday() + "&person=" + personId, function(json) {
  $.getJSON(getContextURLPath() + "/api/events.json?orgUnit=DiszpKrYNg8&program=uy2gU8kT1jF&startDate=2012-01-01&endDate=" + getDateOfToday() + "&person=fSofnQR6lAU", function(json) {

        var events = json.eventList;

        // Loop events
        for (var i = 0; i < events.length; i++) {
            var dataValues = events[i].dataValues;

            // Loop data values
            for (var j = 0; j < dataValues.length; j++) {

                // Test if the data value equals the id for weight data
                if (dataValues[j].dataElement == "UXz7xuGCEhU") {

                    // Store date to sort events
                    var event = new Object();
                    event.date = events[i].eventDate;
                    event.weight = parseInt(dataValues[j].value);
                    event.category = events[i].programStage;
                    eventArray.push(event);
                    console.log(event);
                }
            }
       }

       // Sort events
       eventArray.sort(compareDate);
       var seriesData = [];
        console.log("Length of array: " + eventArray.length);
        console.log("Contents: " + eventArray);
       for (var i = 0; i < eventArray.length; i++) {
           seriesData[i] = [Date.UTC(parseInt(eventArray[i].date.substring(0,4)),parseInt(eventArray[i].date.substring(5,7))-1,parseInt(eventArray[i].date.substring(8,10))), eventArray[i].weight];
           console.log("inside loop" + seriesData[i]);
       }


       makeGraph(seriesData);
    });

}

/*function getCategorieNamesFromIds(categoriesArray) {
    var categoryNames = [];
    $.ajax({
        url: getContextURLPath() + "/api/programStages.json",
        async:false,
        success: function(json){
            var programStages = json.programStages;
            alert("success categories");
            for (var i = 0; i < programStages.length; i++) {

                for (var j = 0; j < categoriesArray.length; j++) {
                    if(programStages[i].id == categoriesArray[j]) {
                        categoryNames[j] = programStages[i].name;
                    }
                }
            }
        }

    });
    return categoryNames;
}
*/
function populateGraph(personId, orgUnitId){

	getWeightData(orgUnitId, personId);
}

function makeGraph(graphData){
    $(function () {
        $('#chart').highcharts({
            title: {
                text: 'Weight development chart',
                x: -20 //center
            },
            subtitle: {
                text: '',
                x: -20
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Weight (kg)'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter:function() {
                    return Highcharts.dateFormat('%Y:%b:%e',this.x) + " : " + this.y + "kg";
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [{
                name: 'Person',
                data: graphData
            }]
        });
    });
}
