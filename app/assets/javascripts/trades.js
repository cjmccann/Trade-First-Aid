$(document).on('turbolinks:load', function() {
    ret = $('#standingsTable')

    if (ret.length) {
        $('#standingsTable').bootstrapTable({
            data: $('#standingsTableData').data('team-stats')
        }).on('all.bs.table', function(name, data) { setDeltaColors(); });

        $('#standingsTable').parent().on('scroll', function () {
            $('.fixed-table-footer').scrollLeft($(this).scrollLeft());
        });
    }

    if ($('#tradeData').length) {
        tradeDataDiv = $('#tradeData')

        if (!tradeDataDiv.data('my-team-stats')) {
            teamStatsArr = $('#standingsTableData').data('team-stats')

            for (var i = 0; i < teamStatsArr.length; i++) {
                if (teamStatsArr[i]['name'] == tradeDataDiv.data('my-team')) {
                    tradeDataDiv.data('my-team-stats', jQuery.extend({}, teamStatsArr[i]));
                }
            }
        }

        tradeDataDiv.data('deltas', { });
    }

    if ($('#tradeData').data('traded-players')) {
        var playersTraded = $('#tradeData').data('traded-players');
        var myTeam = $('#tradeData').data('my-team');
        var otherTeam = $('#tradeData').data('other-team');

        $('#playersTraded').bootstrapTable();

        for (var i = 0; i < playersTraded.length; i++) {
            $('i.fa[data-player-id="' + playersTraded[i] + '"]').toggle();
            givePlayer(playersTraded[i], myTeam, otherTeam);
        }
    }

    $('.teamtable').bootstrapTable();
    $('div#sidebar').height($('div.left').height() + $('#standings').height());        //$('#teamContainer').height() + $('div.team.left').height() + $('#standings').height());
});

$(window).resize(function () {
    $('.teamtable').bootstrapTable('resetView');
    $('#standingsTable').bootstrapTable('resetView');
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

$(document).on('click', '.switchTeamLink', function(e) {
    var href = e.target.getAttribute("href");

    if(href) {
        playersTraded = $('#playersTraded').bootstrapTable('getData', true)
        playersString = '';

        for (var i = 0; i < playersTraded.length; i++) {
            playersString += ('players[]=' + playersTraded[i]['roto_id'] + '&');
        }

        location.href = href + "?otherTeam=" + $(e.target).data('team') + '&' + playersString;
        e.preventDefault();
    }
});

$(document).on('click', '#tradeReset', function(e) {
    resetTrade();
});

$(document).on('mouseup', '#tradeReset', function(e) {
    $(this).blur();
});

function givePlayer(id, myTeam, otherTeam) {
    addPlayerToTable(id, '#playersTraded');

    addPlayerStats(id, otherTeam, false);
    removePlayerStats(id, myTeam, true);

    setTransitions();
}

function getPlayer(id, myTeam, otherTeam) {
    addPlayerToTable(id, '#playersReceived');

    addPlayerStats(id, myTeam, false);
    removePlayerStats(id, otherTeam, true);

    setTransitions();
}

function removeGivenPlayer(id, myTeam, otherTeam) {
    removePlayerFromTable(id, '#playersTraded');

    removePlayerStats(id, otherTeam, false);
    addPlayerStats(id, myTeam, true);

    setTransitions();
}

function removeReceivedPlayer(id, myTeam, otherTeam) {
    removePlayerFromTable(id, '#playersReceived');

    removePlayerStats(id, myTeam, false);
    addPlayerStats(id, otherTeam, true);

    setTransitions();
}


function addPlayerStats(id, team, refresh) {
    tradeDataDiv = $('#tradeData')
    playerData = tradeDataDiv.data('player-stats')[id]
    myTeam = tradeDataDiv.data('my-team')
    deltas = tradeDataDiv.data('deltas')
    statOrder = $('#standingsTableData').data('stat-order')

    tr = $('#standingsTable').find('td:contains("' + team + '")').parent();

    i = 0;
    len = Object.keys(playerData).length - 1;

    for (var stat_key in playerData) {
        reinitTable = false;

        if (refresh && i >= len) {
            reinitTable = true;
        }

        elem = tr.children()[statOrder[stat_key]]

        if (team == myTeam) {
            deltas[stat_key] = getAdditiveDelta(deltas[stat_key], playerData[stat_key]);
        }

        $('#standingsTable').bootstrapTable('updateCell', { 
            index: $(tr).data('index'),
            field: stat_key,
            value: ((parseFloat(elem.innerText) + playerData[stat_key]).toFixed(1)) / 1,
            reinit: reinitTable
        });

        i++;
    }
}

function removePlayerStats(id, team, refresh) {
    tradeDataDiv = $('#tradeData')
    playerData = tradeDataDiv.data('player-stats')[id]
    myTeam = tradeDataDiv.data('my-team')
    deltas = tradeDataDiv.data('deltas')
    statOrder = $('#standingsTableData').data('stat-order')

    tr = $('#standingsTable').find('td:contains("' + team + '")').parent();
    
    i = 0;
    len = Object.keys(playerData).length - 1;

    for (var stat_key in playerData) {
        reinitTable = false;

        if (refresh && i >= len) {
            reinitTable = true;
        }

        elem = tr.children()[statOrder[stat_key]]

        if (team == myTeam) {
            deltas[stat_key] = getSubtractiveDelta(deltas[stat_key], playerData[stat_key]);
        }

        $('#standingsTable').bootstrapTable('updateCell', { 
            index: $(tr).data('index'),
            field: stat_key,
            value: ((parseFloat(elem.innerText) - playerData[stat_key]).toFixed(1)) / 1,
            reinit: reinitTable
        });

        i++;
    }
}

function getAdditiveDelta(oldDelta, newDelta) {
    if (typeof oldDelta === 'undefined') {
        oldDelta = 0
    }

    totalDelta = (parseFloat(oldDelta) + newDelta).toFixed(1) / 1;
    if (totalDelta > 0 && totalDelta <= 0.2) {
        totalDelta = 0
    } else if (totalDelta < 0 && totalDelta >= -0.2) {
        totalDelta = 0
    }

    return formatDeltaString(totalDelta);
}

function getSubtractiveDelta(oldDelta, newDelta) {
    if (typeof oldDelta === 'undefined') {
        oldDelta = 0
    }

    totalDelta = (parseFloat(oldDelta) - newDelta).toFixed(1) / 1;

    if (totalDelta > 0 && totalDelta <= 0.2) {
        totalDelta = 0
    } else if (totalDelta < 0 && totalDelta >= -0.2) {
        totalDelta = 0
    }

    return formatDeltaString(totalDelta);
}

function formatDeltaString(totalDelta) {
    if (totalDelta > 0) {
        totalDelta = '+' + totalDelta
    } else {
        totalDelta = totalDelta.toString();
    }

    return totalDelta;
}

function setTransitions() {
    new_data = $('#standingsTable').bootstrapTable('getRowByUniqueId', $('#tradeData').data('my-team'))
    old_data = $('#tradeData').data('my-team-stats')

    tr = $('#standingsTable').find('td:contains("' + $('#tradeData').data('my-team') + '")').parent();

    statOrder = $('#standingsTableData').data('stat-order')

    for(var key in new_data) {
        if (key == 'name') { continue; }

        if (new_data[key] > old_data[key]) {
            $(tr.children()[statOrder[key]]).addClass('plus');
        } else if (new_data[key] < old_data[key]) {
            $(tr.children()[statOrder[key]]).addClass('minus');
        }
    }

    $('#tradeData').data('my-team-stats',  jQuery.extend({}, new_data));
}

function removeTransitions() {
    $('.plus').removeClass('.plus');
    $('.minus').removeClass('.minus');
}

function addPlayerToTable(id, table_id) {
    var photo_url = $('tr[data-player-id="' + id + '"]').find('img').attr('src');

    $(table_id).bootstrapTable('insertRow', { 
        index: $(table_id + ' tr').length,
        row: { 
            photo: "<img class='player img-circle' src='" + photo_url + "'>",
            name: getPlayerName(id), 
            pos: getPlayerPos(id),
            roto_id: id,
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

function rankFormatter(value, row, index) {
    return "<strong>" + (index + 1) + "</strong>";
}

function teamPicFormatter(value, row, index) {
    return "<img class='teamPhoto img-circle' src='" + row['teamIcon'] + "'>"
}

function formatDeltas(data) {
    deltas = $('#tradeData').data('deltas');

    if (deltas && deltas[this.field]) {
        if (parseFloat(deltas[this.field]) > 0) {
            return '<div class="setDeltaGood">' + deltas[this.field] + '</div>';
        } else if (parseFloat(deltas[this.field]) < 0) {
            return '<div class="setDeltaBad">' + deltas[this.field] + '</div>';
        }
    }

    return '0';
}

function formatDeltaLabel() {
    return '<strong>My Net Change:</strong>';
}

function setDeltaColors() {
    setDeltaGood = $('.setDeltaGood')
    setDeltaGood.each(function() {
        $(this).closest('td').addClass('deltaGood');
        $(this).removeClass('setDeltaGood');
    });

    setDeltaBad = $('.setDeltaBad')
    setDeltaBad.each(function() {
        $(this).closest('td').addClass('deltaBad');
        $(this).removeClass('setDeltaBad');
    });
}


function standingsNameFormatter(value, row, index) {
    if (value == $('#tradeData').data('my-team')) {
        return '<strong>' + value + '</strong>'
    } else {
        return value
    }
}

function resetTrade() {
    myTeam = $('#tradeData').data('my-team');
    otherTeam = $('#tradeData').data('other-team');

    $('.fa-check-square-o:visible').closest('tr').each(function() {
        cur_team = $(this).data('team-name');
        playerId = $(this).data('player-id');

        if (cur_team == myTeam)  {
            removeGivenPlayer(playerId, myTeam, otherTeam);
            $('i.fa[data-player-id="' + playerId + '"]').toggle();
        } else {
            removeReceivedPlayer(playerId, myTeam, otherTeam);
            $('i.fa[data-player-id="' + playerId + '"]').toggle();
        }
    });
}

function teamProjPtsFormatter(value, row, index) {
    return '<strong>' + value + '</strong>';
}
