/**
 * Created by MartinKuenzler on 22.05.16.
 * This is an file to script
 * we want to create an schedule for every class.
 *
 * We can bring the informations from the websites to our webapplication
 * and show this for every person, that has access to the link or URL.
 */
//Cookie laden
var coockiesSafe = document.cookie.split('; ');
var coockies = new Array(null, null);
$.each(coockiesSafe, function (k, speicherKeks) {
    var keks = speicherKeks.split('=');
    switch (keks[0]) {
        case 'beruf_id':
            coockies[0] = keks[1];
            break;
        case 'klasse_id':
            coockies[1] = keks[1];
            break;
    }
});
console.log('KEKS0: ' + coockies[0]);
if (coockies[0] !== null && coockies[0] != "null") {
    $('#deleteCookie').removeClass("hidden");
}
function loadBerufe() {
    var beruf_id, beruf_name;

    $('#beruf').append($('<option/>', {
        value: '',
        text: "Please Select"
    }));
    $.getJSON('http://home.gibm.ch/interfaces/133/berufe.php', null, function (response) {

        $.each(response, function (i, j) {
            beruf_id = null;
            beruf_name = null;

            // Daten verarbeiten
            $.each(j, function (key, val) {
                if (key == "beruf_id") {
                    beruf_id = val;
                } else {
                    beruf_name = val;
                }
            });

            // Option im Select anhängen
            $('#beruf').append($('<option/>', {
                value: beruf_id,
                text: beruf_name
            }));
        });
        $('#beruf').show();
        $('#beruf_loading').hide();
        if (!isNaN(coockies[0])) {
            $('#beruf').val(coockies[0]);
            loadKlassen();
        }
    });
}
function loadKlassen() {
    var changeBeruf = false;
    var klasse_id, klasse_name;
    var id = $('#beruf').val();
    if (isNaN(coockies[0]) || coockies[0] != id) {
        document.cookie = 'klasse_id=';
        $('#klasse').empty();
        $('#klasse').hide();
        $('#klasse_loading').show();
        changeBeruf = true;
    }
    document.cookie = "beruf_id=" + id;

    if (id >= 0 && id != "") {
        //console.log(true);
        $('#klasse').append($('<option/>', {
            value: '',
            text: "Please Select"
        }));
        $.getJSON('http://home.gibm.ch/interfaces/133/klassen.php', 'beruf_id=' + id, function (response) {

            $.each(response, function (i, j) {
                klasse_id = null;
                klasse_name = null;

                // Daten verarbeiten
                $.each(j, function (key, val) {
                    //console.log(val);
                    if (key == "klasse_id") {
                        klasse_id = val;
                    } else if (key = "klasse_longname") {
                        klasse_name = val;
                    }
                });

                //Option im Select anhängen
                $('#klasse').append($('<option/>', {
                    value: klasse_id,
                    text: klasse_name
                }));
            });
            $('#klasse_loading').hide();
            $('#klasse').show();
            if (!isNaN(coockies[1]) && !changeBeruf) {
                $('#klasse').val(coockies[1]);
                klasseSelected(null);
            }
        });
        $('#klasse_div').show();
    } else {
        //console.log(false);
        $('#klasse_div').hide();
    }
}
function klasseSelected(datum) {
    document.cookie = "klasse_id=" + $('#klasse').val();
    $('#deleteCookie').removeClass("hidden");
    $('#kalender_head').html('Scheduler from the class - ' + $("#klasse>option:selected").html());
    loadKalender(datum);
    $('#filter_body').hide();
}

function loadKalender(datum) {
    var datum, wochentag, zeit_von, zeit_bis, lehrer, fach, raum, kommentar, timeDiff, calTitle;

    if ($('#klasse').val() >= 0 && $('#klasse').val() != "") {
        $('#calendar_panel').show();
        $('#calendar').fullCalendar({
            // put your options and callbacks here
            lang: 'en',
            header: false,
            events: function (start, end, timezone, callback) {
                $.ajax({
                    url: 'http://home.gibm.ch/interfaces/133/tafel.php',
                    dataType: 'jsonp',
                    data: {
                        klasse_id: $('#klasse').val(),
                        woche: start.isoWeek() + '-' + start.year()
                    },
                    success: function (response) {
                        var events = [];
                        $.each(response, function (i, j) {
                            datum = null;
                            wochentag = null;
                            zeit_von = null;
                            zeit_bis = null;
                            lehrer = null;
                            fach = null;
                            raum = null;
                            kommentar = null;
                            timeDiff = null;

                            // Daten verarbeiten
                            $.each(j, function (k, l) {
                                $.each(l, function (key, val) {
                                    switch (key) {
                                        case 'tafel_datum':
                                            datum = val;
                                            break;

                                        case 'tafel_wochentag':
                                            wochentag = val;
                                            break;

                                        case 'tafel_von':
                                            zeit_von = val;
                                            break;

                                        case 'tafel_bis':
                                            zeit_bis = val;
                                            break;

                                        case 'tafel_lehrer':
                                            lehrer = val;
                                            break;

                                        case 'tafel_longfach':
                                            fach = val;
                                            break;

                                        case 'tafel_raum':
                                            raum = val;
                                            break;

                                        case 'tafel_kommentar':
                                            kommentar = val;
                                            break;
                                    }
                                });

                                timeDiff = Math.abs(new Date("01/01/1970 " + zeit_von).getTime() / 1000 / 60 - new Date("01/01/1970 " + zeit_bis).getTime() / 1000 / 60);

                                events.push({
                                    title: fach + (timeDiff > 45 ? "\r\n" + lehrer + "\r\n" + raum : ""),
                                    start: datum + "T" + zeit_von,
                                    end: datum + "T" + zeit_bis,
                                    description: fach + "<br />" + lehrer + "<br />" + raum + (kommentar != "" ? "<br /><br /><em>" + kommentar + "</em>" : "")
                                });
                            });
                        });
                        callback(events);
                    }
                });
            },
            weekNumbers: true,
            allDaySlot: false,
            weekends: false, // will hide Saturdays and Sundays
            defaultView: 'agendaWeek',
            contentHeight: 'auto',
            minTime: '07:00:00',
            maxTime: '21:00:00',
            slotLabelFormat: 'H:mm',
            timeFormat: 'H:mm',
            eventRender: function (event, element) {
                element.qtip({
                    position: {
                        my: 'center center',  // Position my top left...
                        at: 'bottom center' // at the bottom right of...
                    },
                    content: event.description
                    //style: {
                    //    classes: 'qtip-youtube'
                    //}
                });
            }
        });
        $('#calendar').fullCalendar('refetchEvents');
    } else {
        //console.log(false);
        $('#calendar_panel').hide();
    }
}
function deleteCookie() {
    $.cookie("beruf_id", null, {path: '/'});
    $.cookie("klasse_id", null, {path: '/'});
}