// $(document).on('turbolinks:load', function() {
//    $(".playerToggle").click(function(){
//        var e = this;
//        console.log('clicked')
//    });
//});

$(document).on('click', '.playerToggle', function(e){
    var tr = $(e.target).closest('tr');

    var playerId = tr.data('player-id');
    var ret = $('i.fa[data-player-id="' + playerId + '"]').toggle();

    var myTeam = $('#tradeData').data('my-team');
    var otherTeam = $('#tradeData').data('other-team');

    if (ret.filter('.fa-check-square-o').is(':visible')) {
        if (tr.data('team-id') == myTeam) {
            givePlayer(playerId);
        } else {
            getPlayer(playerId);
        }
    } else {
        if (tr.data('team-id') == myTeam) {
            removeGivenPlayer(playerId);
        } else {
            removeReceivedPlayer(playerId);
        }
    }
});

function givePlayer(id) {
    addPlayerToTable(id, '#playersTraded')
}

function getPlayer(id) {
    addPlayerToTable(id, '#playersReceived')
}

function removeGivenPlayer(id) {
    removePlayerFromTable(id, '#playersTraded')
}

function removeReceivedPlayer(id) {
    removePlayerFromTable(id, '#playersReceived')
}

function addPlayerToTable(id, table_id) {
    $(table_id).bootstrapTable('insertRow', { 
        index: $(table_id + ' tr').length,
        row: { 
            name: getPlayerName(id), 
            pos: getPlayerPos(id),
        } 
    });
}

function removePlayerFromTable(id, table_id) {
    $(table_id).bootstrapTable('remove', { 
        field: 'name',
        values: [ getPlayerName(id) ]
    });
}

function getPlayerName(id) {
    return $('tr[data-player-id="' + id + '"]').find('td[data-field="name"]').text();
}

function getPlayerPos(id) {
    return $('tr[data-player-id="' + id + '"]').find('td[data-field="pos"]').text();
}
