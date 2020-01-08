

function hide(){
    $("#stage1").hide();
    $("#stage2").attr("class","");
}
$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#join" ).click(function() { hide(); });
});
