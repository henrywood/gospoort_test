<div class="grid-container">

	<div class="grid30">
		<img src="{IMGSRC}" class="img-circle">
	</div>
	<div class="grid70" class="profiledetails">
		<h3>{NAME}</h3>
		<p class="disciplines">{DISCIPLINES}</p>
		<div class="innerText">
			<span class="center-text"><img src="./assets/stylesheets/img/money.png">{PRICE}</span>
		</div>
		<div class="innerText">

		</div>
	</div>


	<!-- MODAL - BEGIN -->

  	<div id="{POPUP_ID}" style="display:none;">

    	<p><a href="#" rel="modal:close">Close</a> or press ESC</p>

    	<br><br>
    	
  		<div style="width:50%; float:left">

	  		Name:<br>
	  		Age:<br>
	  		Gender:<br>
	  		Favorite Discipline:<br>
	  		Registered:<br>

		</div>
  		<div style="width:50%; float:right">

	  		{POPUP_NAME}<br>
	  		{POPUP_AGE}<br>
	  		{POPUP_GENDER}<br>
	  		{POPUP_FAVDIS}<br>
	  		{POPUP_REG}<br>
	  		{POPUP_ABOUT}<br>

  		</div>
  		<div class="clear"></div>
  		<div style="width:50%;float:left">

	  		Address:<br>

		</div>
  		<div style="width:50%; float:right">

	  		{POPUP_ADR}<br>

  		</div>
  		<div class="clear"></div>
  		<div style="width:50%;float:left">

	  		About:<br>

		</div>
  		<div style="width:50%; float:right">

	  		{POPUP_ABOUT}<br>

  		</div>
  		<div class="clear"></div>
  		<div style="width:50%;float:left">

	  		Disciplines:<br>

		</div>
  		<div style="width:50%; float:right">

	  		{DISCIPLINES}<br>

  		</div>
  	</div>

  	<!-- MODAL END -->

  	<!-- Link to open the modal -->
 	<p class="profilebtn"><a class="center-text" href="#{POPUP_ID}" rel="modal:open">View profile</a></p>

</div>
