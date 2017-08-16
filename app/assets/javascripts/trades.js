$(document).on('turbolinks:load', function() {
    ret = $('#standingsTable')

    if (ret.length) {
        $('#standingsTable').bootstrapTable({
            data: $('#tradeData').data('team-stats')
        });
    }

    $('div.sidebar').height($('#teamContainer').height() + $('div.team.left').height() + $('#standings').height());
});

$(document).on('click', '.playerToggle', function(e){
    var tr = $(e.target).closest('tr');

    var playerId = tr.data('player-id');
    var ret = $('i.fa[data-player-id="' + playerId + '"]').toggle();

    var myTeam = $('#tradeData').data('my-team');
    var otherTeam = $('#tradeData').data('other-team');

    if (ret.filter('.fa-check-square-o').is(':visible')) {
        if (tr.data('team-name') == myTeam) {
            givePlayer(playerId, myTeam, otherTeam);
        } else {
            getPlayer(playerId, myTeam, otherTeam);
        }
    } else {
        if (tr.data('team-name') == myTeam) {
            removeGivenPlayer(playerId, myTeam, otherTeam);
        } else {
            removeReceivedPlayer(playerId, myTeam, otherTeam);
        }
    }
});

function givePlayer(id, myTeam, otherTeam) {
    addPlayerToTable(id, '#playersTraded');
    removeTransitions();
    addPlayerStats(id, otherTeam);
    removePlayerStats(id, myTeam);
    setTransitions();
}

function getPlayer(id, myTeam, otherTeam) {
    addPlayerToTable(id, '#playersReceived');
    removeTransitions();
    addPlayerStats(id, myTeam);
    removePlayerStats(id, otherTeam);
    setTransitions();
}

function removeGivenPlayer(id, myTeam, otherTeam) {
    removePlayerFromTable(id, '#playersTraded');
    removeTransitions();
    removePlayerStats(id, otherTeam);
    addPlayerStats(id, myTeam);
    setTransitions();
}

function removeReceivedPlayer(id, myTeam, otherTeam) {
    removePlayerFromTable(id, '#playersReceived');
    removeTransitions();
    removePlayerStats(id, myTeam);
    addPlayerStats(id, otherTeam);
    setTransitions();
}


function addPlayerStats(id, team) {
    playerData = $('#tradeData').data('player-stats')[id]
    statOrder = $('#standingsTableData').data('stat-order')
    myTeam = $('#tradeData').data('my-team')

    tr = $('#standingsTable').find('td:contains("' + team + '")').parent();

    for (var stat_key in playerData) {
        elem = tr.children()[statOrder[stat_key]]

        transitionClass = '';
        if (team == myTeam) {
            transitionClass = '<div class="plus">(+' + playerData[stat_key] + ')</div>';
        }


        $('#standingsTable').bootstrapTable('updateCell', { 
            index: $(tr).data('index'),
            field: stat_key,
            value: (parseFloat(elem.innerText) + playerData[stat_key]).toFixed(1) + transitionClass
        });
    }
}

function removePlayerStats(id, team) {
    playerData = $('#tradeData').data('player-stats')[id]
    statOrder = $('#standingsTableData').data('stat-order')
    myTeam = $('#tradeData').data('my-team')

    tr = $('#standingsTable').find('td:contains("' + team + '")').parent();

    for (var stat_key in playerData) {
        elem = tr.children()[statOrder[stat_key]]

        transitionClass = '';
        if (team == myTeam) {
            transitionClass = '<div class="minus">(-' + playerData[stat_key] + ')</div>';
        }

        $('#standingsTable').bootstrapTable('updateCell', { 
            index: $(tr).data('index'),
            field: stat_key,
            value: (parseFloat(elem.innerText) - playerData[stat_key]).toFixed(1) + transitionClass
        });
    }

}

function setTransitions() {
    $('.minus').each(function() { $(this).parent().addClass('minus'); });
    $('.plus').each(function() { $(this).parent().addClass('plus'); });
}

function removeTransitions() {
    $('div.plus').remove();
    $('.plus').removeClass('.plus');

    $('div.minus').remove();
    $('.minus').removeClass('.minus');
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
