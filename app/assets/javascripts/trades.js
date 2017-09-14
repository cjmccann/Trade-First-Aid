$(document).on('turbolinks:load', function() {
    $('#playersTraded').bootstrapTable({
        formatNoMatches: function () {
            return 'No players selected.';
        }
    });

    $('#playersReceived').bootstrapTable({
        formatNoMatches: function () {
            return 'No players selected.';
        }
    });


    $('#summary').bootstrapTable({
        formatNoMatches: function() {
            return 'No players selected.';
        }
    });


    setTeamContainerHeight();
    setSidebarHeight();
    setSpacerHeight();

    $('.teamtable').bootstrapTable();
    $('.teamtable').bootstrapTable( 'resetView', { height: getTeamTableHeight() });
    
    ret = $('#standingsTable')

    if (ret.length) {
        $('#standingsTable').bootstrapTable({
            data: $('#standingsTableData').data('team-stats'),
        }).on('all.bs.table', function(name, data) { setDeltaColors(); });

        $('#standingsTable').parent().on('scroll', function () {
            $('.fixed-table-footer').scrollLeft($(this).scrollLeft());
        });

        $('#standingsTable').bootstrapTable('resetView', { height: getStandingsTableHeight() });
        addExtraTeamTableHeight();
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

});

$(window).resize(function () {
    $('.teamtable').bootstrapTable( 'resetView', { height: getTeamTableHeight() });
    setTeamContainerHeight();
    setSidebarHeight();
    $('#standingsTable').bootstrapTable('resetView', { height: getStandingsTableHeight() });
    addExtraTeamTableHeight();
    setSpacerHeight();
    $('#summary').bootstrapTable('resetView', { height: getSummaryTableHeight() });
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
    updatePlayerGiven(true, id);

    updateSummaryTable();
    setTransitions();
}

function getPlayer(id, myTeam, otherTeam) {
    addPlayerToTable(id, '#playersReceived');

    addPlayerStats(id, myTeam, false);
    removePlayerStats(id, otherTeam, true);
    updatePlayerReceived(true, id);

    updateSummaryTable();
    setTransitions();
}

function removeGivenPlayer(id, myTeam, otherTeam) {
    removePlayerFromTable(id, '#playersTraded');

    removePlayerStats(id, otherTeam, false);
    addPlayerStats(id, myTeam, true);
    updatePlayerGiven(false, id);

    updateSummaryTable();
    setTransitions();
}

function removeReceivedPlayer(id, myTeam, otherTeam) {
    removePlayerFromTable(id, '#playersReceived');

    removePlayerStats(id, myTeam, false);
    addPlayerStats(id, otherTeam, true);
    updatePlayerReceived(false, id);

    updateSummaryTable();
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
            value: parseFloat(((parseFloat(elem.innerText) + playerData[stat_key]).toFixed(1))),
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
            value: parseFloat(((parseFloat(elem.innerText) - playerData[stat_key]).toFixed(1))),
            reinit: reinitTable
        });

        i++;
    }
}

function updatePlayerGiven(isAdded, id) {
    tradeDataDiv = $('#tradeData')
    playerData = tradeDataDiv.data('player-stats')[id]

    if (isAdded) {
        tradeDataDiv.data('given-player-vals').push(playerData['total']);
    } else {
        tradeDataDiv.data('given-player-vals').splice(tradeDataDiv.data('given-player-vals').indexOf(playerData['total']), 1);
    }
}

function updatePlayerReceived(isAdded, id) {
    tradeDataDiv = $('#tradeData')
    playerData = tradeDataDiv.data('player-stats')[id]

    if (isAdded) {
        tradeDataDiv.data('received-player-vals').push(playerData['total']);
    } else {
        tradeDataDiv.data('received-player-vals').splice(tradeDataDiv.data('received-player-vals').indexOf(playerData['total']), 1);
    }

}

function getAdditiveDelta(oldDelta, newDelta) {
    if (typeof oldDelta === 'undefined') {
        oldDelta = 0
    }

    totalDelta = (parseFloat(oldDelta) + newDelta).toFixed(1);
    if (totalDelta > 0 && totalDelta <= 0.2) {
        totalDelta = 0
    } else if (totalDelta < 0 && totalDelta >= -0.2) {
        totalDelta = 0
    }

    return formatDeltaString(parseFloat(totalDelta));
}

function getSubtractiveDelta(oldDelta, newDelta) {
    if (typeof oldDelta === 'undefined') {
        oldDelta = 0
    }

    totalDelta = (parseFloat(oldDelta) - newDelta).toFixed(1);

    if (totalDelta > 0 && totalDelta <= 0.2) {
        totalDelta = 0
    } else if (totalDelta < 0 && totalDelta >= -0.2) {
        totalDelta = 0
    }

    return formatDeltaString(parseFloat(totalDelta));
}

function formatDeltaString(totalDelta) {
    if (totalDelta > 0) {
        totalDelta = '+' + totalDelta.toString();
    } else {
        totalDelta = totalDelta.toString();
    }

    return totalDelta;
}

function updateSummaryTable() {
    standingsData = $('#standingsTableData');
    deltas = $('#tradeData').data('deltas');
    receivedPlayers = $('#tradeData').data('received-player-vals');
    givenPlayers = $('#tradeData').data('given-player-vals');

    summaryData = [ ];
    summaryData.push( { stat: 'Rank', result: formatDeltaString(standingsData.data('start-rank') - standingsData.data('rank')) } )
    summaryData.push( { stat: 'Proj Pts', result: deltas['total'] } )
    summaryData.push( { stat: 'Avg Pts/Plyr Added', result: (receivedPlayers.reduce( function(a, b) { return a + b; }, 0) 
        / (receivedPlayers.length == 0 ?  1 : receivedPlayers.length)).toFixed(1) });
    summaryData.push( { stat: 'Avg Pts/Plyr Given', result: (givenPlayers.reduce( function(a, b) { return a + b; }, 0) 
        / (givenPlayers.length == 0 ? 1 : givenPlayers.length)).toFixed(1) });

    for(var key in deltas) {
        if (key == 'total' || deltas[key] == '0') { continue; }

        summaryData.push( { stat: key, result: deltas[key] });
    }

    $('#summary').bootstrapTable('load', {
        data: summaryData,
    }).bootstrapTable('resetView', { height: getSummaryTableHeight() });

    setSpacerHeight();
}

function setTransitions() {
    new_data = $('#standingsTable').bootstrapTable('getRowByUniqueId', $('#tradeData').data('my-team'))
    old_data = $('#tradeData').data('my-team-stats')

    tr = $('#standingsTable').find('td:contains("' + $('#tradeData').data('my-team') + '")').parent();

    statOrder = $('#standingsTableData').data('stat-order')

    for(var key in new_data) {
        if (key == 'name') { continue; }

        neg_stats = $('#standingsTableData').data('negative-stats');

        if (!neg_stats.includes(key)) {
            if (new_data[key] > old_data[key]) {
                $(tr.children()[statOrder[key]]).addClass('plus');
            } else if (new_data[key] < old_data[key]) {
                $(tr.children()[statOrder[key]]).addClass('minus');
            }
        } else {
            if (new_data[key] > old_data[key]) {
                $(tr.children()[statOrder[key]]).addClass('minus');
            } else if (new_data[key] < old_data[key]) {
                $(tr.children()[statOrder[key]]).addClass('plus');
            }
        }
    }

    $('#tradeData').data('my-team-stats',  jQuery.extend({}, new_data));
    //$('tr[data-uniqueid="' + $('#tradeData').data('my-team') + '"]')[0].scrollIntoView(true);
    var row = $('tr[data-uniqueid="' + $('#tradeData').data('my-team') + '"]')
    var topPos = row[0].offsetTop;
    var headerHeight = row.parent().siblings('thead').height();
    row.closest('div.fixed-table-body')[0].scrollTop = (topPos - headerHeight);
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
    if (row['name'] == $('#tradeData').data('my-team')) { 
        data_elem = $('#standingsTableData')

        if (!data_elem.data('rank')) {
            data_elem.data('start-rank', index + 1);
        }

        data_elem.data('rank', index + 1); 
    }

    return "<strong>" + (index + 1) + "</strong>";
}

function teamPicFormatter(value, row, index) {
    return "<img class='teamPhoto img-circle' src='" + row['teamIcon'] + "'>"
}

function formatDeltas(data) {
    deltas = $('#tradeData').data('deltas');

    if (deltas && deltas[this.field]) {
        neg_stats = $('#standingsTableData').data('negative-stats');

        if (!neg_stats.includes(this.field)) {
            if (parseFloat(deltas[this.field]) > 0) {
                return '<div class="setDeltaGood">' + deltas[this.field] + '</div>';
            } else if (parseFloat(deltas[this.field]) < 0) {
                return '<div class="setDeltaBad">' + deltas[this.field] + '</div>';
            }
        } else {
            if (parseFloat(deltas[this.field]) > 0) {
                return '<div class="setDeltaBad">' + deltas[this.field] + '</div>';
            } else if (parseFloat(deltas[this.field]) < 0) {
                return '<div class="setDeltaGood">' + deltas[this.field] + '</div>';
            }
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

function setSpacerHeight() {
    $('.spacer').height($('#sidebar').height() - $('.innerSidebarContainer').outerHeight(true) - $('.summary-container').outerHeight(true));
}

function setSidebarHeight() {
    $('div#sidebar').height(getWorkAreaHeight());
}

function setTeamContainerHeight(x) {
    if (x) {
        $('#teamContainer').height(x);
    } else {
        $('#teamContainer').height(getWorkAreaHeight());
    }
}

function getStandingsTableHeight() {
    upper_trade_height = $('#teams').height() + $('#standings-header').height()

    max_height = $('#standingsTable').height() + $('#standingsTable').parent().siblings('div[class="fixed-table-footer"]').height() + 5;
    min_height = 215
    target_height = getWorkAreaHeight() - upper_trade_height;

    if (target_height > max_height) {
        return max_height
    } else if (target_height < min_height) {
        setTeamContainerHeight(upper_trade_height + max_height + 10);
        return max_height
    } else {
        return target_height
    }
}

function getSummaryTableHeight() {
    available_height = $('#sidebar').height() - $('.innerSidebarContainer').outerHeight(true) - $('#summary-header').outerHeight(true);
    min_height = 100;
    full_height = $('#summary').height() + 5;

    if (full_height < available_height) {
        return full_height;
    } else if (available_height < min_height) {
        return full_height;
    } else {
        return available_height;
    }
}

function getWorkAreaHeight() {
    return $(window).height() - $('nav').outerHeight(true);
}

function statFormatter(value, row, index) {
    if (value == 'Rank' || value == 'Proj Pts' || value.includes('Avg Pts')) {
        return '<span class="heavy-cell">' + value + '</span>';
    } else {
        return value;
    }
}

function resultFormatter(value, row, index) {
    if (row['stat'] == 'Rank' || row['stat'] == 'Proj Pts' || row['stat'].includes('Avg Pts')) {
        return '<span class="heavy-cell">' + value + '</span>';
    } else {
        return value;
    }
}

function getTeamTableHeight() {
    return (getWorkAreaHeight() * 0.35) - $('.teamHeader').outerHeight()
}

function addExtraTeamTableHeight() {
    var standingsHeight  = 0;
    $('.standings').each(function() {
          standingsHeight += $(this).height();
    });

    extraTeamH = ($('#teamContainer').height() - $('#teams').height() - standingsHeight);
    $('.teamtable').bootstrapTable( 'resetView', { height: getTeamTableHeight() + extraTeamH });
}
