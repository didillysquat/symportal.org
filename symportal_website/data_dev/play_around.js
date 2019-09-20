// d3.json("data/seqs.absolute.json").then(d => chart(d))
//TODO list includes:
// Have a toggle for absolute/relative
// Have a toggle for pre-MED/post-MED



$(document).ready(function () {


    //Get data and set parameters for charting
    // DATA FOR PRE AND POST MED
    var data_post_med_by_sample = getRectDataPostMEDBySample();
    var data_pre_med_by_sample = getRectDataPreMEDBySample();

    // if plotting absolute values we can get the highest y from the 'post_med_aboslute' property
    var max_y_val_post_med = getRectDataPostMEDBySampleMaxSeq();
    var max_y_val_pre_med = getRectDataPreMEDBySampleMaxSeq();

    // if plotting absolute values we can get the highest y from the 'post_taxa_... ' for the pre-med
    var sample_list = getRectDataPreMEDSampleList();

    // Speed at which the sample by sample plotting will be done initially
    var post_med_init_by_sample_interval = 50
    var pre_med_init_by_sample_interval = 50

    //This initial chart function will take care of all of the svg elements that are not going to change during
    // an update. i.e. when we are changing from relative to absolute data

    // Here we set the margins of the svg chart
    var svg_post_med = d3.select("#chart_post_med"),
		margin = {top: 35, left: 35, bottom: 20, right: 0},
		width = +svg_post_med.attr("width") - margin.left - margin.right,
		height = +svg_post_med.attr("height") - margin.top - margin.bottom;
    var svg_pre_med;
    // Set the x range that will be used for the x val of the bars
	var x_post_med = d3.scaleBand()
		.range([margin.left, width - margin.right])
		.padding(0.1)
    var x_pre_med;


    // Set the y range
	var y_post_med = d3.scaleLinear()
        .rangeRound([height - margin.bottom, margin.top])
    var y_pre_med;


    // Set the colour scale
    // We can set both the range and domain of this as these are invariable between absolute and relative
    // data types
    //TODO synchronise the colour scales between the pre- and post-med seqs.
    // The fill colours of the rect objects are now already in the array of objects

    //Set up the svg element in which we will call the axis objects
    var xAxis_post_med = svg_post_med.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .attr("id", "x_axis_post_med")
    var xAxis_pre_med;
	var yAxis_post_med = svg_post_med.append("g")
		.attr("transform", `translate(${margin.left},0)`)
        .attr("id", "y_axis_post_med")
    var yAxis_pre_med;
//

    //Add a g to the svgs that we will use for the bars
    //We will have a seperate g for each of the samples so that we can hopefully plot column by column
    sample_list.forEach(function(sample){
    // Selectors cannot start with a number apparently so we will add an s
        svg_post_med.append("g").attr("class", "s" + sample.replace(/\./g, "_"))
    })

    // We will start with only the post-MED seqs being plotted. We will check to see what is
    // selected and go with that.
    if ($("#PostMEDAbsDType").hasClass("btn-primary")){
            var data_type = 'absolute';
        } else if ($("#PostMEDRelDType").hasClass("btn-primary")){
            var data_type = 'relative';
        }
        // First do the columns for the post_med
        // Eventually we can make the amount of time this takes dynamic with the number of samples and seqs
        // per sample

        // So that we don't run the same code for the axes etc for every sample we will
        // move this code into the general_update_post_med_by_sample
        // and only run the code specific to the given sample column updating in the
        // update_post_med_by_sample function

        // This var will keep track of the timing that we've already got set up cumulatively
        cum_time = 0
        general_update_by_sample(data_type, 1000, "post")
        for(let i = 0; i < sample_list.length; i++){
             setTimeout(update_by_sample, i * post_med_init_by_sample_interval, sample_list[i], data_type, post_med_init_by_sample_interval, "post");
             cum_time += post_med_init_by_sample_interval;
        }

//         Then do column by column for the pre_med
//        general_update_by_sample(data_type, 1000, "pre")
//        for(let i = 0; i < sample_list.length; i++){
//         setTimeout(update_by_sample, cum_time + (i * pre_med_init_by_sample_interval), sample_list[i], data_type, pre_med_init_by_sample_interval, "pre");
//         cum_time += pre_med_init_by_sample_interval
//        }

    function general_update_by_sample(data_type, speed, pre_post){
        // Update the Y scale's domain depending on whether we are doing absolute or relative data_type
        if (pre_post == "post"){
            y = y_post_med
            x = x_post_med
            max_y = max_y_val_post_med
            svg = svg_post_med
            y_axis_id = "#y_axis_post_med"
            x_axis_id = "#x_axis_post_med"
        }else if (pre_post == "pre"){
            y = y_pre_med
            x = x_pre_med
            max_y = max_y_val_pre_med
            svg = svg_pre_med
            y_axis_id = "#y_axis_pre_med"
            x_axis_id = "#x_axis_pre_med"
        }

        if (data_type == "absolute"){
            y.domain([0, max_y]).nice();
        }else{
            y.domain([0, 1]).nice();
        }

        // Now update the y axis
        svg.select(y_axis_id)
        .transition()
        .duration(speed)
        .call(d3.axisLeft(y).ticks(null, "s"));

        // Set the domain of the x. This should be the sample names
        x.domain(sample_list);

        // Complete the x axis
        // This should be fairly invariable for the time being as we aren't playing with the order of the x axis yet
        svg.selectAll(x_axis_id).transition().duration(speed)
                .call(d3.axisBottom(x).tickSizeOuter(0)).selectAll("text")
                .attr("y", 0).attr("x", 9).attr("dy", ".35em").attr("transform", "rotate(90)")
                .style("text-anchor", "start").style("text-anchor", "start");

    }

    function update_by_sample(col_sample, data_type, speed, pre_post){

        if (pre_post == "post"){
            svg = svg_post_med
            data_by_sample = data_post_med_by_sample
            delay = 5
            x = x_post_med
            y = y_post_med
        }else if (pre_post == "pre"){
            svg = svg_pre_med
            data_by_sample = data_pre_med_by_sample
            delay = 0.1
            x = x_pre_med
            y = y_pre_med
        }

        // Process the post_MED data first.
        var bars = svg.select("g.s" + col_sample.replace(/\./g, "_")).selectAll("rect").data(data_by_sample[col_sample], function(d){
            // In theory because we're working on a sample by sample basis now we should be able to work with just the
            // the seq name as key. But for the time being we'll keep the key as it is.
            return d.seq_name + d.sample;
        });

        bars.exit().remove()

        if (data_type == 'absolute'){
            //if 'absolute' then use the abbreviation 'abs' for getting the attributes
            var abbr = 'abs'
        }else if (data_type == 'relative'){
            // if 'relative' then use the abbreviation 'rel' for getting the attributes
            var abbr = 'rel'
        }

        bars.transition().duration(speed).attr("x", function(d){
            return x(d.sample);
        }).attr("y", function(d){
            return y(eval("d.y_" + abbr));
        }).attr("width", x.bandwidth()).attr("height", function(d){
            return Math.max(y(0) - y(eval("d.height_" + abbr)), 1);}
        ).attr("fill", function(d){
            return d.fill;
        }).delay(function(d,i){return(i*delay)});

        bars.enter().append("rect")
        .attr("x", function(d){
            return x(d.sample);
        }).attr("y", y(0)).transition().duration(1000).attr("y", function(d){
            return y(eval("d.y_" + abbr));
        }).attr("width", x.bandwidth()).attr("height", function(d){
            return Math.max(y(0) - y(eval("d.height_" + abbr)), 1);}
        ).attr("fill", function(d){
            return d.fill;
        });

        var foo = "bar"
    }


	// LISTENERS RELATED TO CHARTING
	// TODO Update to new listener that will be specific to one of the svg plots.
    $(".dtype-btn").click(function(){
        console.log($(this).text());
        //If the button is of class btn light then it is not selected and this click should fire
        // the change in datatype event for the relevant svg
        if($(this).hasClass("btn-light")){
            //First change the button attributes so that it looks like we've registered the clicks
            $(this).parents(".btn-group").find('.dtype-btn').each(function(){
                if ($(this).hasClass("btn-light")){
                    //Switch around the btn styles so that light becomes primary and viceversa
                    $(this).addClass("btn-primary").removeClass("btn-light")
                }else if($(this).hasClass("btn-primary")){
                    $(this).addClass("btn-light").removeClass("btn-primary")
                }
            });

            //Second change update the plot to represent the newly selected datatype
            // This var will keep track of the timing that we've already got set up cumulatively
            cum_time = 0
            general_update_by_sample($(this).text(), 1000, $(this).attr("data-data-type"))
            for(let i = 0; i < sample_list.length; i++){
                 setTimeout(update_by_sample, i * eval($(this).attr("data-data-type") + "_med_init_by_sample_interval"), sample_list[i], $(this).text(), eval($(this).attr("data-data-type") + "_med_init_by_sample_interval"), $(this).attr("data-data-type"));
                 cum_time += eval($(this).attr("data-data-type") + "_med_init_by_sample_interval");
            }
        }
    });

    // WE want to have a listener for the Pre-MED header opening up. When this happens, we will want to plot the
    // pre-med plot, we will also want to remove the rendering the pre-MED seqs text. Also a good idea will be to have
    // a spinner set off in the top right corner.
    $('#pre_med_svg_collapse').on('show.bs.collapse', function(){
        console.log('fish and chips');
        // First check to see if the pre-MED svg has already been initiated. If so then there is nothing
        // to do here.
        //TODO implement the spinner and get rid of the text when open
        if (!$("#chart_pre_med").hasClass("init")){

            //Plot as relative or absolute abundances according to which button is currently primary
            if($("#PreMEDRelDType").hasClass("btn-primary")){
                var data_type = "relative";
            }else{
                var data_type = "absolute";
            }

            //Now do the init of the pre-MED svg
            svg_pre_med = d3.select("#chart_pre_med"),
            margin = {top: 35, left: 35, bottom: 20, right: 0},
            width = +svg_pre_med.attr("width") - margin.left - margin.right,
            height = +svg_pre_med.attr("height") - margin.top - margin.bottom;

            // Set the x range that will be used for the x val of the bars
            x_pre_med = d3.scaleBand()
            .range([margin.left, width - margin.right])
            .padding(0.1)

            // Set the y range
            y_pre_med = d3.scaleLinear()
            .rangeRound([height - margin.bottom, margin.top])

            //Set up the svg element in which we will call the axis objects
            xAxis_pre_med = svg_pre_med.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .attr("id", "x_axis_pre_med")

            yAxis_pre_med = svg_pre_med.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .attr("id", "y_axis_pre_med")

            //Add a g to the svgs that we will use for the bars
            //We will have a seperate g for each of the samples so that we can hopefully plot column by column
             sample_list.forEach(function(sample){
                svg_pre_med.append("g").attr("class", "s" + sample.replace(/\./g, "_"))
             });

            general_update_by_sample(data_type, 1000, "pre")
            for(let i = 0; i < sample_list.length; i++){
                setTimeout(update_by_sample, cum_time + (i * pre_med_init_by_sample_interval), sample_list[i], data_type, pre_med_init_by_sample_interval, "pre");
                cum_time += pre_med_init_by_sample_interval;
            }

        }

    });


    //INIT MAP
    function initMap() {

        var location = new google.maps.LatLng(22.193730, 38.957069);

        var mapCanvas = document.getElementById('map');
        var mapOptions = {
            center: location,
            zoom: 10,
            panControl: false,
            mapTypeId: google.maps.MapTypeId.SATELLITE
        }
        var map = new google.maps.Map(mapCanvas, mapOptions);


        var contentString = '<div >' +
            '<span style="font-weight:bold;">lat:</span> 32.18876, <span style="font-weight:bold;">lon:</span> 98.7985, <span style="font-weight:bold;">site_name:</span> --, <span style="font-weight:bold;">num_samples:</span> 42'+
        '</div>'+
        '<table class="table table-hover table-sm" style="font-size:0.5rem;">'+
            '<thead>'+
                '<tr>'+
                    '<th>sample_name</th>'+
                    '<th>host_taxa</th>'+
                    '<th>depth</th>'+
                '</tr>'+
            '</thead>'+
            '<tbody>'+
            '<tr>'+
                '<td>Xj.wer.28392</td>'+
                '<td>P. lobata</td>'+
                '<td>2-8m</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Xj.wer.28392</td>'+
                '<td>P. lobata</td>'+
                '<td>2-8m</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Xj.wer.28392</td>'+
                '<td>P. lobata</td>'+
                '<td>2-8m</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Xj.wer.28392</td>'+
                '<td>P. lobata</td>'+
                '<td>2-8m</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Xj.wer.28392</td>'+
                '<td>P. lobata</td>'+
                '<td>2-8m</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Xj.wer.28392</td>'+
                '<td>P. lobata</td>'+
                '<td>2-8m</td>'+
            '</tr>'+
            '</tbody>'+
        '</table>';

        var marker_data = [{'lat': 22.235196, 'lng': 39.006563, 'label': "reef_1"}, {'lat': 22.190266, 'lng': 38.978879, 'label': "reef_2"}]

        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });

        marker_data.forEach(function(data){
            var marker =  new google.maps.Marker({
            position: {lat: data['lat'], lng: data['lng']},
            map:map
            });

            marker.addListener('click', function() {
                infowindow.open(map, marker);
            });
        });
//        var first_marker = new google.maps.Marker({position: {lat: 22.235196, lng: 39.006563}, map:map, label:"reef_two"})
//        var second_marker = new google.maps.Marker({position: {lat: 22.190266, lng: 38.978879}, map:map, label:"Thuwal"})

//        var markerCluster = new MarkerClusterer(map, map_markers,
//            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

    }

    google.maps.event.addDomListener(window, 'load', initMap);


});







