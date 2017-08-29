addEventListener('turbolinks:load', function() {
    $('[data-toggle="table"]').bootstrapTable();
    $('div#favStandings').height($('#favTeamContainer').height());
    if($('#syncManager').data('sync-team')) {
        showBusyIndicator('Syncing teams...')

        $.ajax({
            type: 'GET',
            url: '/leagues/' + $('#syncManager').data('league') + '/sync',
            data: { 
                test: 123
            },
            success: hideBusyIndicator
        });
    }
});


