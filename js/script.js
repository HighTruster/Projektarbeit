//Cookie laden
var speicherKekse = document.cookie.split('; ');
var kekse = new Array(null, null);


$.each(speicherKekse, function (k, speicherKeks) {
    var keks = speicherKeks.split('=');
    switch (keks[0]) {
        case 'beruf_id':
            kekse[0] = keks[1];
            break;
        case 'klasse_id':
            kekse[1] = keks[1];
            break;
    }
});
//console.log('KEKS0: ' + kekse[1]);



/**
 * Die Funktion loadBerufe
 * bezieht von der URL: http://home.gibm.ch/interfaces/133/berufe.php
 * Ein JSON Format mit allen eingespeicherten Berufen, welche in der
 * Berufsschule GIBM unterrichtet werden. Dies bedeutet, dass die
 * Berufsmaturklassen sowie alle KTSI-Lehränge aufgelistet werden können
 *
 * Zudem wird in die ID-Beruf eine Auswahl der Klassen in der Form eines
 * Dropdown-Menüs eingespeichert.
 *
 * Dadurch kann der Benutzer sich durch die Berufe wählen und den gewünschten
 * Beruf auswählen.
 *
 *
 */
function loadBerufe() {
    var beruf_id, beruf_name;

    $('#beruf').append($('<option/>', {
        value: '',
        text: "Please select your profession"
    }));
    $.getJSON('http://home.gibm.ch/interfaces/133/berufe.php', null, function (response) {

        $.each(response, function (i, j) {
            beruf_id = null;
            beruf_name = null;


            $.each(j, function (key, val) {
                if (key == "beruf_id") {
                    beruf_id = val;
                } else {
                    beruf_name = val;
                }
            });

            $('#beruf').append($('<option/>', {
                value: beruf_id,
                text: beruf_name
            }));
        });
        $('#beruf').show();
        $('#beruf_loading').hide();
        if (!isNaN(kekse[0])) {
            $('#beruf').val(kekse[0]);
            loadKlassen(); // Es wird die Funktion loadKlassen aufgerufen.
        }
    });
}
/**
 * Mit der loadKlassen Funktion können wir
 */
function loadKlassen() {
    var changeBeruf = false;
    var klasse_id, klasse_name;
    var id = $('#beruf').val();
    if (isNaN(kekse[0]) || kekse[0] != id) {
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
            text: "Please select your class"
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
            if (!isNaN(kekse[1]) && !changeBeruf) {
                $('#klasse').val(kekse[1]);
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
    $('#kalender_head').html('Scheduler form  - ' + $("#klasse>option:selected").html());
    loadKalender(datum);
    $('#filter_body').hide();
}


function loadKalender(datum) {
    var datum, wochentag, zeit_von, zeit_bis, lehrer, fach, raum, kommentar, timeDiff, calTitle;

    if ($('#klasse').val() >= 0 && $('#klasse').val() != "") {
        $('#calendar_panel').show();
        $('#calendar').fullCalendar({
            // put your options and callbacks here
            lang: 'de',
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
            allDaySlot: true,
            weekends: true,
            defaultView: 'agendaWeek',
            contentHeight: 'auto',
            minTime: '07:00:00',
            maxTime: '21:00:00',
            slotLabelFormat: 'HH:mm',
            timeFormat: 'HH:mm',
          /*  eventRender: function (event, element) {
                element.qtip({
                    position: {
                        my: 'center center',
                        at: 'bottom center'
                    },
                    content: event.description
                });
            }*/
        });
        $('#calendar').fullCalendar('refetchEvents');
    } else {
        //console.log(false);
        $('#calendar_panel').hide();
    }
}

/**
 * deleteCookie
 * Wird dazu verwendet, die Cookies der Webseite zu löschen
 * dies geschieht so, das der Pfad aufgerufen wird und mit leeren Zeichen
 * gefült wird
 * Beispiel: beruf_id = 1
 * nach dieser Funktion ist beruf_id = " "
 * genau so wir dies für die klasse_id durchgeführt.
 */
function deleteCookie() {
    $.cookie("beruf_id", "", {path: '/html'});
    $.cookie("klasse_id", "", {path: '/html'});
}