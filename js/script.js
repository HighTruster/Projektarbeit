/**
 * Created by MartinKuenzler on 22.05.16.
 * This is an file to script
 * we want to create an schedule for every class.
 *
 * We can bring the informations from the websites to our webapplication
 * and show this for every person, that has access to the link or URL.
 */
//Cookie laden
var speicherKekse = document.cookie.split('; ');
var kekse = new Array(null,null);

$.each(speicherKekse,function(k,speicherKeks){
    var keks = speicherKeks.split('=');
    switch(keks[0]){
        case 'beruf_id':
            kekse[0] = keks[1];
            break;
        case 'klasse_id':
            kekse[1] = keks[1];
            break;
    }
});

console.log('KEKS0: '+kekse[0]);

if(kekse[0] !== null && kekse[0] != "null"){
    $('#deleteCookie').removeClass("hidden");
}
function loadBerufe() {
    var beruf_id, beruf_name;

    $('#beruf').append($('<option/>', {
        value: '',
        text: "Bitte Auswählen"
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
        if (!isNaN(kekse[0])) {
            $('#beruf').val(kekse[0]);
            loadKlassen();
        }
    });
}
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
            text: "Bitte Auswählen"
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
