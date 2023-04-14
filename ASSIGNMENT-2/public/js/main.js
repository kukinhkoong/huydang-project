$(document).ready(function(){
    $(".delete-recipe").on("click", function(e){
        $target = $(e.target);
        const id = $target.attr("data-id");
        $.ajax({
            type: "DELETE",
            url: "/recipes/" + id,
            success: function(response){
                alert("Deleting Recipe");
                window.location.href="/";
            },
            error: function(err){
                console.log(err);
            }
        })
    })
});
