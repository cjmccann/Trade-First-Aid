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

    //$('.teamtable').bootstrapTable( 'resetView', { height: getTeamTableHeight() });
    //setTeamContainerHeight();
    //setSidebarHeight();

    $('.teamtable').bootstrapTable();
    
    let ret = $('#standingsTable')

    if (ret.length) {
        $('#standingsTable').bootstrapTable({
            data: $('#standingsTableData').data('team-stats'),
        }).on('all.bs.table', function(name, data) { setDeltaColors(); });

        $('#standingsTable').parent().on('scroll', function () {
            $('.fixed-table-footer').scrollLeft($(this).scrollLeft());
        });

        //$('#standingsTable').bootstrapTable('resetView', { height: getStandingsTableHeight() });
        //addExtraTeamTableHeight();
    }

    if ($('#tradeData').length) {
        let tradeDataDiv = $('#tradeData')

        if (!tradeDataDiv.data('my-team-stats')) {
            let teamStatsArr = $('#standingsTableData').data('team-stats')

            for (let i = 0; i < teamStatsArr.length; i++) {
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

    if ($('#tradeData').data('added-player')) {
        var playerAdded = $('#tradeData').data('added-player');
        var myTeam = $('#tradeData').data('my-team');
        var otherTeam = $('#tradeData').data('other-team');

        $('#playersReceived').bootstrapTable();

        $('i.fa[data-player-id="' + playerAdded + '"]').toggle();
        getPlayer(playerAdded, myTeam, otherTeam);
    }

    resizeTables();

    $('.teamheader-dropdown').on("show.bs.dropdown", function () {
        var dropdownToggle = $(this).find("#teamHeaderButton");
        var dropdownMenu = $(this).find(".teams-dropdown-menu");

        dropdownMenu.css({
            "top": (dropdownToggle.position().top + dropdownToggle.outerHeight()) + "px",
            "left": dropdownToggle.position().left + "px"
        });
    });

    setTimeout(function () {
        $('#standingsTable').bootstrapTable('resetWidth')
    }, 300);

});

$(window).resize(resizeTables);

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
        let playersTraded = $('#playersTraded').bootstrapTable('getData', true)
        let playersString = '';

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

$(document).on('mouseup', '#myTeamHeader', function(e) {
    $(this).blur();
});

$(document).on('click', 'th.search-icon', toggleSearch);

$(document).on('blur', '#search', toggleSearch);

$(document).on('click', '.search-close', toggleSearch);

$(document).on('click', '#teamHeaderButton', function(e) { $(this).blur(); });

function givePlayer(id, myTeam, otherTeam) {
    selectPlayerCheckbox(id);
    let tradeDataDiv = $('#tradeData')
    let myTeamId = tradeDataDiv.data('my-team-id');
    let otherTeamId = tradeDataDiv.data('other-team-id');

    addPlayerToTable(id, '#playersTraded');

    givePlayerReallocPos(id, myTeamId, otherTeamId);
    updateTeamStats(myTeam, myTeamId, false);
    updateTeamStats(otherTeam, otherTeamId, true);
    updatePlayerGiven(true, id);

    updateSummaryTable();
    setTransitions();
}

function getPlayer(id, myTeam, otherTeam) {
    selectPlayerCheckbox(id);
    let tradeDataDiv = $('#tradeData')
    let myTeamId = tradeDataDiv.data('my-team-id');
    let otherTeamId = tradeDataDiv.data('other-team-id');

    addPlayerToTable(id, '#playersReceived');

    getPlayerReallocPos(id, myTeamId, otherTeamId);
    updateTeamStats(myTeam, myTeamId, false);
    updateTeamStats(otherTeam, otherTeamId, true);
    updatePlayerReceived(true, id);

    updateSummaryTable();
    setTransitions();
}

function removeGivenPlayer(id, myTeam, otherTeam) {
    deselectPlayerCheckbox(id);
    let tradeDataDiv = $('#tradeData')
    let myTeamId = tradeDataDiv.data('my-team-id');
    let otherTeamId = tradeDataDiv.data('other-team-id');

    removePlayerFromTable(id, '#playersTraded');

    removeGivenPlayerReallocPos(id, myTeamId, otherTeamId);
    updateTeamStats(myTeam, myTeamId, false);
    updateTeamStats(otherTeam, otherTeamId, true);
    updatePlayerGiven(false, id);

    updateSummaryTable();
    setTransitions();
}

function removeReceivedPlayer(id, myTeam, otherTeam) {
    deselectPlayerCheckbox(id);
    let tradeDataDiv = $('#tradeData')
    let myTeamId = tradeDataDiv.data('my-team-id');
    let otherTeamId = tradeDataDiv.data('other-team-id');

    removePlayerFromTable(id, '#playersReceived');

    removeReceivedPlayerReallocPos(id, myTeamId, otherTeamId);
    updateTeamStats(myTeam, myTeamId, false);
    updateTeamStats(otherTeam, otherTeamId, true);
    updatePlayerReceived(false, id);

    updateSummaryTable();
    setTransitions();
}

function selectPlayerCheckbox(playerId) {
    let tr = $('tr[data-player-id="' + playerId + '"]')

    tr.closest('table').bootstrapTable('updateCell', { 
        index: tr.data('index'),
        field: 'cb',
        value: checkedFaIcon(playerId),
        reinit: false
    });
}

function deselectPlayerCheckbox(playerId) {
    let tr = $('tr[data-player-id="' + playerId + '"]')

    tr.closest('table').bootstrapTable('updateCell', { 
        index: tr.data('index'),
        field: 'cb',
        value: uncheckedFaIcon(playerId),
        reinit: false
    });
}

function updateTeamStats(teamName, teamId, refresh) {
    let tradeDataDiv = $('#tradeData');
    let stats = $('#standingsTableData');
    let teamOrder = stats.data(teamId + '-sorted');
    let initStats = stats.data(teamId + '-init-stats');
    let newStats = { };

    for (var i = 0; i < teamOrder.length; i++) { 
        if (teamOrder[i].benched) { continue; }

        let playerData = tradeDataDiv.data('player-stats')[teamOrder[i].id]

        for (var stat_key in playerData) {
            if (!newStats[stat_key]) { newStats[stat_key] = 0 }
            newStats[stat_key] += playerData[stat_key]
        }
    }

    setTeamDeltas(teamName, initStats, newStats, refresh, tradeDataDiv);
}

function setTeamDeltas(team, initStats, newStats, refresh, tradeDataDiv) {
    let myTeam = tradeDataDiv.data('my-team')
    let deltas = tradeDataDiv.data('deltas')
    let tr = $('#standingsTable').find('td:contains("' + team + '")').parent();

    let i = 0;
    let len = Object.keys(newStats).length - 1;

    for (var stat_key in newStats) {
        let reinitTable = false;

        if (refresh && i >= len) {
            reinitTable = true;
        }

        let delta = (newStats[stat_key] - initStats[stat_key]).toFixed(1);

        if (delta > 0 && delta <= 0.2) {
            delta = 0
        } else if (delta < 0 && delta >= -0.2) {
            delta = 0
        }

        if (team == myTeam) {
            deltas[stat_key] = formatDeltaString(parseFloat(delta))
        }

        $('#standingsTable').bootstrapTable('updateCell', { 
            index: $(tr).data('index'),
            field: stat_key,
            value: parseFloat(newStats[stat_key].toFixed(1)),
            reinit: reinitTable
        });

        i++;
    }
}

function updatePlayerGiven(isAdded, id) {
    let tradeDataDiv = $('#tradeData')
    let playerData = tradeDataDiv.data('player-stats')[id]

    if (isAdded) {
        tradeDataDiv.data('given-player-vals').push(playerData['total']);
    } else {
        tradeDataDiv.data('given-player-vals').splice(tradeDataDiv.data('given-player-vals').indexOf(playerData['total']), 1);
    }
}

function updatePlayerReceived(isAdded, id) {
    let tradeDataDiv = $('#tradeData')
    let playerData = tradeDataDiv.data('player-stats')[id]

    if (isAdded) {
        tradeDataDiv.data('received-player-vals').push(playerData['total']);
    } else {
        tradeDataDiv.data('received-player-vals').splice(tradeDataDiv.data('received-player-vals').indexOf(playerData['total']), 1);
    }

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
    let standingsData = $('#standingsTableData');
    let deltas = $('#tradeData').data('deltas');
    let receivedPlayers = $('#tradeData').data('received-player-vals');
    let givenPlayers = $('#tradeData').data('given-player-vals');

    let summaryData = [ ];
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
    let new_data = $('#standingsTable').bootstrapTable('getRowByUniqueId', $('#tradeData').data('my-team'))
    let old_data = $('#tradeData').data('my-team-stats')

    let tr = $('#standingsTable').find('td:contains("' + $('#tradeData').data('my-team') + '")').parent();

    let statOrder = $('#standingsTableData').data('stat-order')

    for(var key in new_data) {
        if (key == 'name') { continue; }

        let neg_stats = $('#standingsTableData').data('negative-stats');

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
    let row = $('tr[data-uniqueid="' + $('#tradeData').data('my-team') + '"]')
    let topPos = row[0].offsetTop;
    let headerHeight = row.parent().siblings('thead').height();
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
        let data_elem = $('#standingsTableData')

        if (!data_elem.data('rank')) {
            data_elem.data('start-rank', index + 1);
        }

        data_elem.data('rank', index + 1); 
    }

    return (index + 1);
}

function rankStyle(value, row, index, field) {
    let tradeData = $('#tradeData')

    if (row['name'] == tradeData.data('my-team') || row['name'] == tradeData.data('other-team')) { 
        return {
            classes: 'btn-success',
            css: { 
                'font-weight': 'bolder', 
                'color': 'black',
                'opacity': 0.9
            }
        }
    } else {
        return {
            css: { 'font-weight': 'bolder' }
        }
    }
}

function teamPicFormatter(value, row, index) {
    return "<img class='teamPhoto img-circle' src='" + row['teamIcon'] + "'>"
}

function formatDeltas(data) {
    let deltas = $('#tradeData').data('deltas');

    if (deltas && deltas[this.field]) {
        let neg_stats = $('#standingsTableData').data('negative-stats');

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
    return 'My Net Change:';
}

function setDeltaColors() {
    let setDeltaGood = $('.setDeltaGood')
    setDeltaGood.each(function() {
        $(this).closest('td').addClass('deltaGood');
        $(this).removeClass('setDeltaGood');
    });

    let setDeltaBad = $('.setDeltaBad')
    setDeltaBad.each(function() {
        $(this).closest('td').addClass('deltaBad');
        $(this).removeClass('setDeltaBad');
    });
}


function standingsNameFormatter(value, row, index) {
    /**
    if (value == $('#tradeData').data('my-team')) {
        return '<strong>' + value + '</strong>'
    } else {
        return value
    }
     **/

    return value;
}

function standingsNameStyle(value, row, index) {
    if (value == $('#tradeData').data('my-team')) {
        return {
            css: { 'font-weight': 'bolder' }
        }
    } else {
        return { };
    }
}

function resetTrade() {
    let myTeam = $('#tradeData').data('my-team');
    let otherTeam = $('#tradeData').data('other-team');

    $('table#my-team').find('.fa-check-square-o:visible').closest('tr').each(function() {
        let playerId = $(this).data('player-id');

        removeGivenPlayer(playerId, myTeam, otherTeam);
    });

    refreshTeamTables();

    $('table#other-team').find('.fa-check-square-o:visible').closest('tr').each(function() {
        let playerId = $(this).data('player-id');

        removeReceivedPlayer(playerId, myTeam, otherTeam);
    });

    refreshTeamTables();
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
    let upper_trade_height = $('#teams').height() + $('#standings-header').height()

    let max_height = $('#standingsTable').height() + $('#standingsTable').parent().siblings('div[class="fixed-table-footer"]').height() + 5;
    let min_height = 215
    let target_height = getWorkAreaHeight() - upper_trade_height;

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
    let available_height = $('#sidebar').height() - $('.innerSidebarContainer').outerHeight(true) - $('#summary-header').outerHeight(true);
    let min_height = 100;
    let full_height = $('#summary').height() + 5;

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
    let standings_height  = 0;
    $('.standings').each(function() {
          standings_height += $(this).height();
    });

    let max_height = $('.teamtable[data-toggle="table"]').height() + 3;
    let extra_team_h = ($('#teamContainer').height() - $('#teams').height() - standings_height);
    let target_height = getTeamTableHeight() + extra_team_h

    if (target_height > max_height) {
        $('.teamtable').bootstrapTable( 'resetView', { height: max_height });
    } else {
        $('.teamtable').bootstrapTable( 'resetView', { height: target_height });
    }
}

function resizeTables () {
    $('.teamtable').bootstrapTable( 'resetView', { height: getTeamTableHeight() })
    setTeamContainerHeight();
    setSidebarHeight();
    $('#standingsTable').bootstrapTable('resetView', { height: getStandingsTableHeight() });
    
    addExtraTeamTableHeight();
    $('#summary').bootstrapTable('resetView', { height: getSummaryTableHeight() })
    setSpacerHeight();
}

function footerStyle(value, row, index) {
    return {
        css: { "font-weight": "700" }
    };
}

function toggleSearch(e) {
    $('.overlay').toggle();
    $('.search-close').toggle();
    let search = $('#search')
    search.toggle();
    if (search.is(":visible")) {
        search.focus();
        $('#search').autocomplete({
                minLength: 2,
                source: $('#tradeData').data('search'),
                response: function(event, ui) {
                    if (ui.content.length === 0) {
                        ui['content'].push({ 'label': 'No players found!', 'value': -1, 't': ''  })
                    }
                },
                focus: function(event, ui) {
                    $('#search').val(ui.item.label);
                    return false;
                },
                // Once a value in the drop down list is selected, do the following:
                select: function(event, ui) {
                    switchToTargetPlayer(ui['item']);
                    return false;
                }
        }).autocomplete( "instance" )._renderItem = function( ul, item ) {
            return $( "<li>" )
                .append( "<div class='search-result'><span class='search-name'>" + item.label + "</span></br><span class='search-team'>" + item.t + "</span></div>" )
                .appendTo( ul );
        };
    } else { 
        $('#search').val('');
    }
}


function switchToTargetPlayer(data) {
    if (data.value == -1) {
        $('#search').val('').blur();
        $('#myTeamHeader').focus();
        return;
    }

    var href = location.protocol + '//' + location.host + location.pathname

    let playersTraded = $('#playersTraded').bootstrapTable('getData', true)
    let playersString = '';

    for (var i = 0; i < playersTraded.length; i++) {
        playersString += ('players[]=' + playersTraded[i]['roto_id'] + '&');
    }

    location.href = href + "?otherTeam=" + data.tid + '&' + playersString + '&targetPlayer=' + data.value
}

function toggleBenchCb(e) {
    if ($('input.use-bench').is(':checked')) {
        $('input.use-bench').prop('checked', false);
    } else {
        $('input.use-bench').prop('checked', true);
    }
    e.stopPropagation();
}

function givePlayerReallocPos(id, myTeam, otherTeam) {
    let stats = $('#standingsTableData');
    let initPos = stats.data('init-pos');
    let prevPos = stats.data('prev-pos');
    let myTeamOrder = stats.data(myTeam + '-sorted');
    let otherTeamOrder = stats.data(otherTeam + '-sorted');

    let indexRemove = -1

    for (var i = 0; i < myTeamOrder.length; i++) { 
        if (myTeamOrder[i].id == id) {
            indexRemove = i;
        }
    }

    otherTeamOrder.push(myTeamOrder.splice(indexRemove, 1)[0]);
    otherTeamOrder.sort(compareVals);

    let positionSettings = jQuery.extend({}, stats.data('position-settings'));

    for (var i = 0; i < myTeamOrder.length; i++) { 
        let cur = myTeamOrder[i]

        if(positionSettings[cur.pos] > 0) {
            setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos, false, false);
            myTeamOrder[i]['benched'] = false;
            positionSettings[cur.pos]--
        } else {
            let flexPos = getFlexPos(positionSettings, cur.pos);

            if (flexPos == null) {
                setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos + ' (BN)', false, false);
                myTeamOrder[i]['benched'] = true;
            } else {
                setChangedPos(cur.id, initPos[cur.id], prevPos, flexPos, false, false);
                myTeamOrder[i]['benched'] = false;
                positionSettings[flexPos]--
            }
        }
    }

    positionSettings = jQuery.extend({}, stats.data('position-settings'));

    for (var i = 0; i < otherTeamOrder.length; i++) { 
        let cur = otherTeamOrder[i];
        let setTraded = null;
        cur.id == id ? setTraded = true : setTraded = false;

        if(positionSettings[cur.pos] > 0) {
            setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos, setTraded, false);
            otherTeamOrder[i]['benched'] = false;
            positionSettings[cur.pos]--
        } else {
            let flexPos = getFlexPos(positionSettings, cur.pos);

            if (flexPos == null) {
                setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos + ' (BN)', setTraded, false);
                otherTeamOrder[i]['benched'] = true;
            } else {
                setChangedPos(cur.id, initPos[cur.id], prevPos, flexPos, setTraded, false);
                otherTeamOrder[i]['benched'] = false;
                positionSettings[flexPos]--
            }
        }
    }

    refreshTeamTables();
}

function getPlayerReallocPos(id, myTeam, otherTeam) {
    let stats = $('#standingsTableData');
    let initPos = stats.data('init-pos');
    let prevPos = stats.data('prev-pos');
    let myTeamOrder = stats.data(myTeam + '-sorted');
    let otherTeamOrder = stats.data(otherTeam + '-sorted');

    let indexRemove = -1

    for (var i = 0; i < otherTeamOrder.length; i++) { 
        if (otherTeamOrder[i].id == id) {
            indexRemove = i;
        }
    }

    myTeamOrder.push(otherTeamOrder.splice(indexRemove, 1)[0]);
    myTeamOrder.sort(compareVals);

    let positionSettings = jQuery.extend({}, stats.data('position-settings'));

    for (var i = 0; i < myTeamOrder.length; i++) { 
        let cur = myTeamOrder[i]
        let setTraded = null;
        cur.id == id ? setTraded = true : setTraded = false;

        if(positionSettings[cur.pos] > 0) {
            setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos, setTraded, false);
            myTeamOrder[i]['benched'] = false;
            positionSettings[cur.pos]--
        } else {
            let flexPos = getFlexPos(positionSettings, cur.pos);

            if (flexPos == null) {
                setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos + ' (BN)', setTraded, false);
                myTeamOrder[i]['benched'] = true;
            } else {
                setChangedPos(cur.id, initPos[cur.id], prevPos, flexPos, setTraded, false);
                myTeamOrder[i]['benched'] = false;
                positionSettings[flexPos]--
            }
        }
    }

    positionSettings = jQuery.extend({}, stats.data('position-settings'));

    for (var i = 0; i < otherTeamOrder.length; i++) { 
        let cur = otherTeamOrder[i];

        if(positionSettings[cur.pos] > 0) {
            setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos, false, false);
            otherTeamOrder[i]['benched'] = false;
            positionSettings[cur.pos]--
        } else {
            let flexPos = getFlexPos(positionSettings, cur.pos);

            if (flexPos == null) {
                setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos + ' (BN)', false, false);
                otherTeamOrder[i]['benched'] = true;
            } else {
                setChangedPos(cur.id, initPos[cur.id], prevPos, flexPos, false, false);
                otherTeamOrder[i]['benched'] = false;
                positionSettings[flexPos]--
            }
        }
    }

    refreshTeamTables();
}

function removeGivenPlayerReallocPos(id, myTeam, otherTeam) {
    let stats = $('#standingsTableData');
    let initPos = stats.data('init-pos');
    let prevPos = stats.data('prev-pos');
    let myTeamOrder = stats.data(myTeam + '-sorted');
    let otherTeamOrder = stats.data(otherTeam + '-sorted');

    let indexRemove = -1

    for (var i = 0; i < otherTeamOrder.length; i++) { 
        if (otherTeamOrder[i].id == id) {
            indexRemove = i;
        }
    }

    myTeamOrder.push(otherTeamOrder.splice(indexRemove, 1)[0]);
    myTeamOrder.sort(compareVals);

    let positionSettings = jQuery.extend({}, stats.data('position-settings'));

    for (var i = 0; i < myTeamOrder.length; i++) { 
        let cur = myTeamOrder[i]
        let removeTraded = null;
        cur.id == id ? removeTraded = true : removeTraded = false;

        if(positionSettings[cur.pos] > 0) {
            setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos, false, removeTraded);
            myTeamOrder[i]['benched'] = false;
            positionSettings[cur.pos]--
        } else {
            let flexPos = getFlexPos(positionSettings, cur.pos);

            if (flexPos == null) {
                setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos + ' (BN)', false, removeTraded);
                myTeamOrder[i]['benched'] = true;
            } else {
                setChangedPos(cur.id, initPos[cur.id], prevPos, flexPos, false, removeTraded);
                myTeamOrder[i]['benched'] = false;
                positionSettings[flexPos]--
            }
        }
    }

    positionSettings = jQuery.extend({}, stats.data('position-settings'));

    for (var i = 0; i < otherTeamOrder.length; i++) { 
        let cur = otherTeamOrder[i];

        if(positionSettings[cur.pos] > 0) {
            setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos, false, false);
            otherTeamOrder[i]['benched'] = false;
            positionSettings[cur.pos]--
        } else {
            let flexPos = getFlexPos(positionSettings, cur.pos);

            if (flexPos == null) {
                setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos + ' (BN)', false, false);
                otherTeamOrder[i]['benched'] = true;
            } else {
                setChangedPos(cur.id, initPos[cur.id], prevPos, flexPos, false, false);
                otherTeamOrder[i]['benched'] = false;
                positionSettings[flexPos]--
            }
        }
    }

    refreshTeamTables();
}

function removeReceivedPlayerReallocPos(id, myTeam, otherTeam) {
    let stats = $('#standingsTableData');
    let initPos = stats.data('init-pos');
    let prevPos = stats.data('prev-pos');
    let myTeamOrder = stats.data(myTeam + '-sorted');
    let otherTeamOrder = stats.data(otherTeam + '-sorted');

    let indexRemove = -1

    for (var i = 0; i < myTeamOrder.length; i++) { 
        if (myTeamOrder[i].id == id) {
            indexRemove = i;
        }
    }

    otherTeamOrder.push(myTeamOrder.splice(indexRemove, 1)[0]);
    otherTeamOrder.sort(compareVals);

    let positionSettings = jQuery.extend({}, stats.data('position-settings'));

    for (var i = 0; i < myTeamOrder.length; i++) { 
        let cur = myTeamOrder[i]

        if(positionSettings[cur.pos] > 0) {
            setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos, false, false);
            myTeamOrder[i]['benched'] = false;
            positionSettings[cur.pos]--
        } else {
            let flexPos = getFlexPos(positionSettings, cur.pos);

            if (flexPos == null) {
                setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos + ' (BN)', false, false);
                myTeamOrder[i]['benched'] = true;
            } else {
                setChangedPos(cur.id, initPos[cur.id], prevPos, flexPos, false, false);
                myTeamOrder[i]['benched'] = false;
                positionSettings[flexPos]--
            }
        }
    }

    positionSettings = jQuery.extend({}, stats.data('position-settings'));

    for (var i = 0; i < otherTeamOrder.length; i++) { 
        let cur = otherTeamOrder[i];
        let removeTraded = null;
        cur.id == id ? removeTraded = true : removeTraded = false;

        if(positionSettings[cur.pos] > 0) {
            setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos, false, removeTraded);
            otherTeamOrder[i]['benched'] = false;
            positionSettings[cur.pos]--
        } else {
            let flexPos = getFlexPos(positionSettings, cur.pos);

            if (flexPos == null) {
                setChangedPos(cur.id, initPos[cur.id], prevPos, cur.pos + ' (BN)', false, removeTraded);
                otherTeamOrder[i]['benched'] = true;
            } else {
                setChangedPos(cur.id, initPos[cur.id], prevPos, flexPos, false, removeTraded);
                otherTeamOrder[i]['benched'] = false;
                positionSettings[flexPos]--
            }
        }
    }

    refreshTeamTables();
}

function setChangedPos(id, initPos, prevPos, curPos, setTraded, removeTraded) {
    let td = $('td[data-player-pos="pos-' + id + '"]');

    if (removeTraded && td.text() == 'TRADED') {
        let parent_table = td.closest('table')
        
        parent_table.bootstrapTable('updateCell', { 
            index: td.parent().data('index'),
            field: 'pos',
            value: curPos,
            reinit: false
        });

        parent_table.attr('id') == 'my-team' ? remove_table = 'other-team' : remove_table = 'my-team'

        removePlayerRow(id, remove_table);
    }

    if (setTraded) {
        let parent_table = td.closest('table')

        parent_table.bootstrapTable('updateCell', { 
            index: td.parent().data('index'),
            field: 'pos',
            value: 'TRADED',
            reinit: false
        });

        parent_table.attr('id') == 'my-team' ? insert_table = 'other-team' : insert_table = 'my-team'

        insertPlayerRow(id, parent_table.attr('id'), insert_table, curPos);

        prevPos[id] = curPos;

    } else if (prevPos[id] != curPos) {
        if (td.text() != 'TRADED') {
            td.closest('table').bootstrapTable('updateCell', { 
                index: td.parent().data('index'),
                field: 'pos',
                value: curPos,
                reinit: false
            });
        }

        prevPos[id] = curPos;
    }
}

function insertPlayerRow(id, sourceTable, targetTable, curPos) {
    let data = getRowData(id, sourceTable)
    data['pos'] = curPos;

    $('table#' + targetTable).bootstrapTable('insertRow', { 
        index: $('table#' + targetTable + ' tr').length,
        row: data
    });
}

function removePlayerRow(id, targetTable) {
    $('table#' + targetTable).bootstrapTable('remove', { 
        field: 'name',
        values: [ getPlayerName(id) ]
    });
}

function getRowData(id, table) {
    let data = { }

    $('tr[data-player-id="' + id + '"]').find('td').each(function(index) {
        if ($(this).data('field') == 'cb') { 
            data['cb'] = ''
        } else {
            data[$(this).data('field')] = $(this).html().trim();
        }
    });

    return data;
}

function getFlexPos(settings, curPos) {
    switch(curPos) {
        case 'WR':
            if (settings['W/T'] > 0) {
                return 'W/T';
            } else if (settings['W/R'] > 0) {
                return 'W/R';
            } else if (settings['W/R/T'] > 0) {
                return 'W/R/T';
            } else if (settings['Q/W/R/T'] > 0) {
                return 'Q/W/R/T';
            } else {
                return null;
            }
        case 'RB':
            if (settings['W/R'] > 0) {
                return 'W/R';
            } else if (settings['W/R/T'] > 0) {
                return 'W/R/T';
            } else if (settings['Q/W/R/T'] > 0) {
                return 'Q/W/R/T';
            } else {
                return null;
            }
        case 'TE':
            if (settings['W/T'] > 0) {
                return 'W/T';
            } else if (settings['W/R/T'] > 0) {
                return 'W/R/T';
            } else if (settings['Q/W/R/T'] > 0) {
                return 'Q/W/R/T';
            } else {
                return null;
            }
        case 'QB':
            if (settings['Q/W/R/T'] > 0) {
                return 'Q/W/R/T';
            } else {
                return null;
            }
    }

    return null;
}

function compareVals(a,b) {
      if (a.val < b.val)
            return 1;
      if (a.val > b.val)
            return -1;
      return 0;
}

function checkedFaIcon(id) {
    return '<i data-player-id="' + id + '" style="display:none;" class="fa fa-square-o"></i><i data-player-id="' + id + '" class="fa fa-check-square-o"></i>'
}

function uncheckedFaIcon(id) {
    return '<i data-player-id="' + id + '" class="fa fa-square-o"></i><i data-player-id="' + id + '" style="display:none;" class="fa fa-check-square-o"></i>'
}

function benchStyle(row, index) {
    if (row.pos.includes('BN')) {
        return {
            classes: 'benched'
        };
    } else if (row.pos.includes('TRADED')) {
        return {
            classes: 'traded'
        };
    }

    return {};
}

function refreshTeamTables() {
    $('table#my-team').bootstrapTable('updateCell', { 
        index: 0,
        field: 'name',
        value: $($('table#my-team').find('tr[data-index="0"]').find('td')[2]).text().trim(),
        reinit: true,
    });

    $('table#other-team').bootstrapTable('updateCell', { 
        index: 0,
        field: 'name',
        value: $($('table#other-team').find('tr[data-index="0"]').find('td')[2]).text().trim(),
        reinit: true,
    });

    //$('.teamtable').bootstrapTable( 'resetView', { });
}
