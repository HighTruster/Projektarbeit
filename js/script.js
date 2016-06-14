/**
 * Wir verwenden die Cookies und können so mit die einzelnen Datenpakete
 * aus unseren Feldern speichern.
 * und weiter verwenden in der Variable cookieSave.
 * @type {Array}
 */
var savingCookies = document.cookie.split('; ');
/**
 * Cookies wird als Array definirt mit zwei verschiedenen Werten
 * Diese Werte werden zu einem späteren Zeitpunkt gespeichert und
 * eingefügt.
 * In die Cookies werden die beruf_id und die klassen_id eingespeichert.
 * Somit können diese Werte dazuverwendet, um die Anzeige auf einem neuen
 * Fenster wieder zu verwenden.
 * @type {Array}
 */
var cookies = new Array(null, null);
/**
 * Diese Funktion erstellt die Cookies für unsere Webanwendung
 * dabei werden die Daten dazu werden die Werte  in unser Arry gespeichert.
 * Wir spliten die erhaltenen Daten nach einem Gleichheitszeichen.
 * Mit dem Switch Case können wir diese ganz einfach in das Array speichern
 * Sollte es in diesem Punkt das Wort "beruf_id" enthalten wird dieser wert in
 * das Array gespeichert (Bsp. 3)
 * Sowie auch bei der "klasse_id".
 */
$.each(savingCookies, function (k, savingCookies) {
    var cookie = savingCookies.split('=');
    switch (cookie[0]) {
        case 'beruf_id':
            cookies[0] = cookie[1];
            break;
        case 'klasse_id':
            cookies[1] = cookie[1];
            break;
    }
});
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
    // erstellung der verwendete Variablen
    var beruf_id, beruf_name;
// Erstellung der auswahlen m
    $('#beruf').append($('<option/>', {
        value: '', //Besitzt keinen Wert an sich (für die Weiterverarbeitung)
        text: "Please select your profession" // wird ins Dropdown geschrieben
    }));
    $.getJSON('http://home.gibm.ch/interfaces/133/berufe.php', null, function
        (response) {

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
        if (!isNaN(cookies[0])) {
            $('#beruf').val(cookies[0]);
            loadClass(); // Es wird die Funktion loadClass aufgerufen.
        }
    });
}
/**
 * Mit der loadClass Funktion können wir alle klasen des ausgewählten
 * Berufs in einem weiterendropdown Menü angezeigt. Diese erhatlen
 * danach auch einen weiteren Wert, der für die weiterverarbeitung wichtig ist.
 */
function loadClass() {
    //Variablen werden definiert mit var name
    var changeBeruf = false;
    var klasse_id, klasse_name;
    var id = $('#beruf').val();
    if (isNaN(cookies[0]) || cookies[0] != id) {
        document.cookie = 'klasse_id=';
        $('#klasse').empty();
        $('#klasse').hide();
        $('#klasse_loading').show();
        changeBeruf = true;
    }
    //Speicherung der beruf_id in als Cookie.
    document.cookie = "beruf_id=" + id;
    if (id >= 0 && id != "") {
        $('#klasse').append($('<option/>', {
            value: '',
            text: "Please select your class"
        }));
        // erhalten aller Daten (Klassen des ausgewählten Berufes)
        $.getJSON('http://home.gibm.ch/interfaces/133/klassen.php', 'beruf_id='
            + id, function (response) {

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
            if (!isNaN(cookies[1]) && !changeBeruf) {
                $('#klasse').val(cookies[1]);
                classSelected(null);
            }
        });
        $('#klasse_div').show();
    } else {
        //console.log(false);
        $('#klasse_div').hide();
    }
}
/**
 *Die ausgewählten Klassen sollten auf dem Kalender dargestellt werden.
 * @param datum
 */
function classSelected(datum) {
    document.cookie = "klasse_id=" + $('#klasse').val();
    $('#deleteCookie').removeClass("hidden");
    $('#kalender_head').html('Scheduler form  - ' + $("#klasse>option:selected").html());
    loadCalendar(datum);
    $('#filter_body').hide();
}
/**
 * loadCalendar ermöglicht es alle wichtigen Daten auf dem Kalender zu schreiben
 * Diese Funktion wurde eigens und mittels dem
 * @param datum
 */
function loadCalendar(datum) {
    var date, weekday, time_from, time_to, teacher, subject, place, comment, timeDiff;

    if ($('#klasse').val() >= 0 && $('#klasse').val() != "") {
        $('#calendar_panel').show();
        $('#calendar').fullCalendar({
            // put your options and callbacks here
            lang: 'de', // Sprache für die anwendung
            header: false,

            events: function (start, end, timezone, callback) {
                $.ajax({
                    // Quelle der Daten die verwendet werden (über URL)
                    url: 'http://home.gibm.ch/interfaces/133/tafel.php',
                    // Datentyp der verwendet werden soll
                    dataType: 'jsonp',
                    // Weiterführung der URL
                    data: {
                        klasse_id: $('#klasse').val(),
                        woche: start.isoWeek() + '-' + start.year()
                    },
                    // ist dies durchgelaufen und erfolgreich werden die Daten
                    // weiterverwendet.
                    success: function (response) {
                        var events = [];
                        $.each(response, function (i, j) {
                            // Variablen werden erstellt
                            date = null;
                            weekday = null;
                            time_from = null;
                            time_to = null;
                            teacher = null;
                            subject = null;
                            place = null;
                            comment = null;
                            timeDiff = null;

                            // Daten werden verarbeiten
                            $.each(j, function (k, l) {
                                $.each(l, function (key, val) {
                                    switch (key) {
                                        // Datum wird erstellt
                                        case 'tafel_datum':
                                            date = val;
                                            break;
                                        // Wochentage werden eingesetzt
                                        case 'tafel_wochentag':
                                            weekday = val;
                                            break;
                                        // Startzeit der Lektion
                                        case 'tafel_von':
                                            time_from = val;
                                            break;
                                        // Endzeit der Lektion
                                        case 'tafel_bis':
                                            time_to = val;
                                            break;
                                        // wer ist der Lehrer
                                        case 'tafel_lehrer':
                                            teacher = val;
                                            break;
                                        // Bezeichnung des Fachs
                                        case 'tafel_longfach':
                                            subject = val;
                                            break;
                                        // Raum der Lektion (Bsp. P 1.5)
                                        case 'tafel_raum':
                                            place = val;
                                            break;
                                        // Bemerkungen für die Stunden ()
                                        case 'tafel_kommentar':
                                            comment = val;
                                            break;
                                    }
                                });
                                // erstellung der Zeit
                                timeDiff = Math.abs(new Date("01/01/1970 " + time_from).getTime() / 1000 / 60 - new Date("01/01/1970 " + time_to).getTime() / 1000 / 60);
                                // erstellung einer neuen BEschreibung für tbl.
                                events.push({
                                    title: subject + (timeDiff > 45 ? "\r\n" + teacher + "\r\n" + place : ""),
                                    start: date + "T" + time_from,
                                    end: date + "T" + time_to,
                                    description: subject + "<br />" + teacher + "<br />" + place + (comment != "" ? "<br /><br /><em>" + comment + "</em>" : "")
                                });
                            });
                        });
                        callback(events);
                    }
                });
            },
            weekNumbers: true, // Wochenzahl wird angezeigt
            allDaySlot: true, // Alle Tage können verwendet werden
            weekends: true, // Wochenende werden angezeigt (für KTSI wichtig)
            defaultView: 'agendaWeek', //Standart ansicht von fullcalendar.io
            contentHeight: 'auto', // Automatische Höhe der Tabellen
            minTime: '07:00:00', // Startzeit des Kalenders
            maxTime: '21:00:00', // Endzeit des Kalenders
            slotLabelFormat: 'HH:mm', // Anzeige des Zeitformats 08:00
            timeFormat: 'HH:mm', // Anzeige des Zeitformats 08:00
            eventRender: function (event, element) {
                element.qtip({
                    position: {
                        my: 'center center',
                        at: 'bottom center'
                    },
                    content: event.description
                });
            }
        });
        $('#calendar').fullCalendar('refetchEvents');
    } else {
        // Der Kalender wird versteckt, wenn die Daten leer sind
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

