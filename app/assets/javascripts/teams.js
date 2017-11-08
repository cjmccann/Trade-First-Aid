addEventListener('turbolinks:load', function() {
    $('#teamTable').bootstrapTable();
    $('#favStandingsTable').bootstrapTable();
    $('div#favStandings').height($('#favTeamContainer').height());

    if ($('#syncManager').data('sync-success')) {
        hideBusyIndicator();
        setStatusSuccess();
    }

    if($('#syncManager').data('sync-team')) {
        syncTeam();
    }

    $('.fav-tooltip').tooltip();

    $(document).on('click', '#setFavorite', setFavorite);

    $('#favStandingsTable').bootstrapTable({
        data: $('#favStandingsTableData').data('team-stats'),
    });

});

$(document).on('click', '.importButton', function(e){
    showBusyIndicator('Importing team...');
});

$(document).on('click', '#refreshButton', forceSyncTeam);
$(document).on('click', '#statusButton', forceSyncTeam);

function syncTeam(force) {
    setStatusBusy();
    disableTradeButton();

    $.ajax({
        type: 'GET',
        url: '/leagues/' + $('#syncManager').data('league') + '/sync',
        data: { 
            force: force
        },
        success: handleSyncSuccess,
        error: handleSyncFailure,
    });
}

function forceSyncTeam() {
    startRefreshIcon();
    syncTeam(true);
}

function handleSyncSuccess(d) {
    hideBusyIndicator();
    stopRefreshIcon();
    enableTradeButton();
    
    if (d.status == 'update') {
        location.replace("?synced=true");
    } else if (d.status == 'no-update') {
        setStatusSuccess();
    }
}

function handleSyncFailure(d) {
    hideBusyIndicator();
    enableTradeButton();
    setStatusWarning();
}

function favNameFormatter(value, row, index) {
    if (value == $('#favStandingsTableData').data('my-team')) {
        return '<strong>' + value + '</strong>'
    } else {
        return value
    }
}

function enableTradeButton() {
    $('.tradeButton').removeClass('disabled')
    $('.tradeButton').prop('disabled', false);
}

function disableTradeButton() {
    $('.tradeButton').addClass('disabled')
    $('.tradeButton').prop('disabled', true);
}

function setStatusBusy() {
    let elem = $('#statusButton');
    elem.html('<i class="fa fa-cog fa-spin fa-fw"></i> Syncing rosters...');
    setStatusButtonClass(elem, 'btn-info');
}

function setStatusSuccess() {
    let elem = $('#statusButton');
    elem.html('<i class="fa fa-check-circle-o"></i> Synced!');
    setStatusButtonClass(elem, 'btn-success');
}

function setStatusWarning() {
    let elem = $('#statusButton');
    elem.html('<i class="fa fa-warning"></i> Update failed. Try again later.');
    setStatusButtonClass(elem, 'btn-warning');
}

function setStatusFavorited() {
    let elem = $('#statusButton');
    elem.html('<i class="fa fa-check-circle-o"></i> Set as favorite.');
    setStatusButtonClass(elem, 'btn-success');
}

function setStatusFavWarning() {
    let elem = $('#statusButton');
    elem.html('<i class="fa fa-warning"></i> Setting as favorite failed. Try again later.');
    setStatusButtonClass(elem, 'btn-warning');
}

function setStatusButtonClass(elem, aClass) {
    let btn_classes = ['btn-info', 'btn-success', 'btn-warning']

    for(let i = 0; i < btn_classes.length; i++) {
        if (btn_classes[i] == aClass) {
            elem.addClass(aClass);
        } else {
            elem.removeClass(btn_classes[i]);
        }
    }
}

function startRefreshIcon() {
    $('#refreshButton').children('i').addClass('fa-spin')
}

function stopRefreshIcon() {
    $('#refreshButton').children('i').removeClass('fa-spin')
}

function setFavorite() {
    $('#setFavorite').children('i').addClass('fa-heart')
    $('#setFavorite').children('i').removeClass('fa-heart-o')

    $.ajax({
        type: 'GET',
        url: '/teams/' + $('#syncManager').data('team') + '/set_favorite',
        data: { 
        },
        success: handleSetFavoriteSuccess,
        error: setStatusFavWarning,
    });
}

function handleSetFavoriteSuccess() {
    setStatusFavorited();

    let team = $('#syncManager').data('team')
    let heart_i = $('a:has(i[class*="fa-heart"])').find('i').detach();

    heart_i.appendTo($('a[href="/teams/' + team + '"]'))

    $(document).off('click', '#setFavorite', setFavorite);
    $('#setFavorite').tooltip();
}

function rankFormatter(value, row, index) {
    if (row['name'] == $('#tradeData').data('my-team')) { 
        let data_elem = $('#favStandingsTableData')

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
