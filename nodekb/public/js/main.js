$(document).ready(function(){
  $('.delete-product').on('click',function(e){
    $target = $(e.target);
    const id = ($target.attr('data-id'));
    $.ajax({
      type:'DELETE',
      url: '/products/'+id,
      success: function(response){
        alert('Deleting Product');
        window.location.href='/';
      },
      error:function(err){
        console.log(err);
      }
    });
  });
});
