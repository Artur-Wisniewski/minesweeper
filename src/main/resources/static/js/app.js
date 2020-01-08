

function hide(){
    if( $('#room-id').val() == "" ||  $('#name').val() == "" )
    {
        preventDefault();
    }
    $("#stage1").hide();
    $("#stage2").attr("class","");

    $("#room-id-display").text($("#room-id").val());

}
$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#join" ).click(function() { hide(); });
});
