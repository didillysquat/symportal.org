// d3.json("data/seqs.absolute.json").then(d => chart(d))
//TODO list includes:
// Have a toggle for absolute/relative
// Have a toggle for pre-MED/post-MED




$(document).ready(function () {

    //INIT title
    $("#study_title").html(getStudyMetaInfo()['title']);
    //INIT authors
    $("#authors").html(getStudyMetaInfo()['author_list']);
    //INIT affiliations
    $("#affiliations").html(getStudyMetaInfo()['affiliations']);
    //INIT sliders for distance plots
    $("#sample_mask_slider").slider({});
    $("#profile_mask_slider").slider({});
    console.log('we got here');
    //TODO make it so that if the data for the elements do not exists they get display set to hidden
    //Get data and set parameters for charting

    // Create Tooltips
    let tip_seqs = d3.tip().attr('class', 'd3-tip').direction('e').offset([0,5])
        .html(function(d) {
            let content = '<div style="background-color:rgba(255,255,255,0.9);">' +
            '<span style="margin-left: 2.5px;"><b>' + d.seq_name + '</b></span><br>' +
            '</div>';
            return content;
        });
    let tip_profiles = d3.tip().attr('class', 'd3-tip').direction('e').offset([0,5])
        .html(function(d) {
            let content = '<div style="background-color:rgba(255,255,255,0.9);">' +
            '<span style="margin-left: 2.5px;"><b>' + d.profile_name + '</b></span><br>' +
            '</div>';
            return content;
        });

    // Get the sample and profile meta info
    let profile_meta_info = getProfileMetaInfo();
    let sample_meta_info = getSampleMetaInfo();

    // Add a g to the bar plot svgs that we will use for the bars on a sample by sample basis
    // We will have a seperate g for each of the samples so that we can plot column by column
    // The pre-med plot will not get init until later.
    function add_sample_groups_to_bar_svgs(svg_element, sample_list){
        sample_list.forEach(function(sample){
            svg_element.append("g").attr("class", "s" + sample);
        })
    }

    // DATA FOR PRE, POST MED and PROFILE
    // POST MED BARS
    let sorting_keys = Object.keys(getSampleSortedArrays());
    let sorted_sample_uid_arrays = getSampleSortedArrays();

    let svg_post_med = d3.select("#chart_post_med");
    let data_post_med_by_sample;
    let max_y_val_post_med;
    let sample_list_post;
    let post_med_bars_exists = false;
    let post_med_init_by_sample_interval = 10;
    //INIT margins, widths and heights for the bar plots
    let margin = {top: 35, left: 35, bottom: 20, right: 0};
    let seq_prof_width;
    let seq_prof_height;
    let seq_prof_height_modal;
    // margin used for the inverted profile_modal plot
    let inv_prof_margin = {top: 5, left: 35, bottom: 20, right: 0};
    let x_post_med;
    let y_post_med;
    let xAxis_post_med;
    let yAxis_post_med;
    if (typeof getRectDataPostMEDBySample === "function") {
        data_post_med_by_sample = getRectDataPostMEDBySample();
        post_med_bars_exists = true;
        max_y_val_post_med = getRectDataPostMEDBySampleMaxSeq();
        if (sorting_keys.includes('profile_based')){
            sample_list_post = sorted_sample_uid_arrays['profile_based'];
        }else{
            sample_list_post = sorted_sample_uid_arrays['similarity'];
        }
        // INIT the width and height of the chart
        $("#post_med_card").find(".seq_prof_chart").attr("width", ((sample_list_post.length * 13) + 70).toString());
        seq_prof_width = +svg_post_med.attr("width") - margin.left - margin.right;
        seq_prof_height = +svg_post_med.attr("height") - margin.top - margin.bottom;
        // Init x and y scales
        x_post_med = d3.scaleBand()
		.range([margin.left, seq_prof_width - margin.right])
		.padding(0.1);
		y_post_med = d3.scaleLinear()
        .rangeRound([seq_prof_height - margin.bottom, margin.top]);
        // Init the axis group
        xAxis_post_med = svg_post_med.append("g")
        .attr("transform", `translate(0,${seq_prof_height - margin.bottom})`)
        .attr("id", "x_axis_post_med");
        yAxis_post_med = svg_post_med.append("g")
		.attr("transform", `translate(${margin.left},0)`)
        .attr("id", "y_axis_post_med");
        // INIT the drop down with the sample sorting categories we have available
        let sort_dropdown_to_populate = $("#post_med_card").find(".svg_sort_by");
        for (let i = 0; i < sorting_keys.length; i ++){
            sort_dropdown_to_populate.append(`<a class="dropdown-item" >${sorting_keys[i]}</a>`);
        }
        // Add the groups per sample for plotting in
        add_sample_groups_to_bar_svgs(svg_post_med, sample_list_post);
        // Call the tool tip
        svg_post_med.call(tip_seqs);
    }else{
        // Hide the card if the data to populate it doesn't exist
        $("#post_med_card").attr("display", "none");
    }



    // Get list of profile uids sorted by local abund order
    let profile_uid_order = getProfileUIDSortedLocalAbund()
    //PROFILE BARS
    let svg_profile = d3.select("#chart_profile");
    let svg_post_med_modal = d3.select("#chart_post_med_modal");
    let svg_profile_modal = d3.select("#chart_profile_modal");
    let data_profile_by_sample;
    let sample_list_modal;
    let max_y_val_profile;
    let sample_list_profile;
    let profile_bars_exists = false;
    let profile_init_by_sample_interval = 10;
    let x_profile;
    let y_profile;
    let y_profile_modal;
    let xAxis_profile;
    let xAxis_post_med_modal;
    let xAxis_profile_modal;
    if (typeof getRectDataProfileBySample === "function") {
        data_profile_by_sample = getRectDataProfileBySample();
        profile_bars_exists = true;
        max_y_val_profile = getRectDataProfileBySampleMaxSeq();
        if (sorting_keys.includes('profile_based')){
            sample_list_profile = sorted_sample_uid_arrays['profile_based'];
            sample_list_modal = sorted_sample_uid_arrays['profile_based'];
        }else{
            sample_list_profile = sorted_sample_uid_arrays['similarity'];
            sample_list_modal = sorted_sample_uid_arrays['similarity'];
        }
        $("#profile_card").find(".seq_prof_chart").attr("width", ((sample_list_profile.length * 13) + 70).toString());
        // Init the width of the modal chart too if we have profile data
        $("#seq-prof-modal").find(".seq_prof_chart").attr("width", ((sample_list_modal.length * 13) + 70).toString());
        // Need to manually calculate the pixels for height as we rely on returning these pixels for the scales
        // Viewport height
        let vp_height = window.innerHeight;
        // 30% of this
        let height_for_modal_svg = 0.35 * vp_height
        $("#seq-prof-modal").find(".seq_prof_chart").attr("height", height_for_modal_svg);
        seq_prof_height_modal = +svg_post_med_modal.attr("height") - margin.top - margin.bottom;
        // Init x and y scales
        x_profile = d3.scaleBand()
		.range([margin.left, seq_prof_width - margin.right])
		.padding(0.1);
		x_modal = d3.scaleBand()
		.range([margin.left, seq_prof_width - margin.right])
		.padding(0.1);
		y_profile = d3.scaleLinear()
        .rangeRound([seq_prof_height - margin.bottom, margin.top]);
        // Y is inverted for the inverted profile plot
		y_post_modal = d3.scaleLinear()
        .rangeRound([seq_prof_height_modal - margin.bottom, margin.top]);
		y_profile_modal = d3.scaleLinear()
        .rangeRound([inv_prof_margin.top, seq_prof_height_modal - inv_prof_margin.bottom]);
        // Set up the axes groups
        // Profile
        xAxis_profile = svg_profile.append("g")
        .attr("transform", `translate(0,${seq_prof_height - margin.bottom})`)
        .attr("id", "x_axis_profile");
        yAxis_profile = svg_profile.append("g")
		.attr("transform", `translate(${margin.left},0)`)
        .attr("id", "y_axis_profile");
        // Post-MED modal
        xAxis_post_med_modal = svg_post_med_modal.append("g")
        .attr("transform", `translate(0,${seq_prof_height_modal - margin.bottom})`)
        .attr("id", "x_axis_post_med_modal");
        yAxis_post_med_modal = svg_post_med_modal.append("g")
		.attr("transform", `translate(${margin.left},0)`)
        .attr("id", "y_axis_post_med_modal");
        // Profile modal
        // inverted profile modal plot is axis is only moved down by top margin
        xAxis_profile_modal = svg_profile_modal.append("g")
        .attr("transform", `translate(0,${inv_prof_margin.top})`)
        .attr("id", "x_axis_profile_modal");
        yAxis_profile_modal = svg_profile_modal.append("g")
		.attr("transform", `translate(${margin.left},0)`)
        .attr("id", "y_axis_profile_modal");

        // INIT the drop down with the sample sorting categories we have available
        let sort_dropdown_to_populate_profile = $("#profile_card").find(".svg_sort_by");
        let sort_dropdown_to_populate_modal = $("#seq-prof-modal").find(".svg_sort_by");
        for (let i = 0; i < sorting_keys.length; i ++){
            sort_dropdown_to_populate_profile.append(`<a class="dropdown-item" >${sorting_keys[i]}</a>`);
            sort_dropdown_to_populate_modal.append(`<a class="dropdown-item" >${sorting_keys[i]}</a>`);
        }
        // Add the groups per sample for plotting in
        add_sample_groups_to_bar_svgs(svg_profile, sample_list_profile);
        add_sample_groups_to_bar_svgs(svg_profile_modal, sample_list_modal);
        add_sample_groups_to_bar_svgs(svg_post_med_modal, sample_list_modal);
        // Call tool tips
        svg_post_med_modal.call(tip_seqs);
        svg_profile.call(tip_profiles);
        svg_profile_modal.call(tip_profiles);
    }else{
        // Hide the card if the data to populate it doesn't exist
        $("#profile_card").attr("display", "none");
        // if the profile data doesn't exist then we don't have need for the modal so we should hide
        // the modal buttons.
        $(".viewer_link_seq_prof").attr("display", "none");
    }



    //PRE-MED BARS
    let data_pre_med_by_sample;
    let max_y_val_pre_med;
    let sample_list_pre;
    let pre_med_bars_exists = false;
    let pre_med_init_by_sample_interval = 50;
    let svg_pre_med;
    let x_pre_med;
    let y_pre_med;
    let xAxis_pre_med;
    let yAxis_pre_med;
    if (typeof getRectDataPreMEDBySample === "function") {
        data_pre_med_by_sample = getRectDataPreMEDBySample();
        pre_med_bars_exists = true;
        max_y_val_pre_med = getRectDataPreMEDBySampleMaxSeq();
        // TODO we can remove this map in future as I have fixed this in SP
        if (sorting_keys.includes('profile_based')){
            sample_list_pre = sorted_sample_uid_arrays['profile_based'];
        }else{
            sample_list_pre = sorted_sample_uid_arrays['similarity'];
        }
        if (sorting_keys.includes('profile_based')){
            sample_list_pre = sorted_sample_uid_arrays['profile_based'];
        }else{
            sample_list_pre = sorted_sample_uid_arrays['similarity'];
        }
        $("#pre_med_card").find(".seq_prof_chart").attr("width", ((sample_list_pre.length * 13) + 70).toString());
        // INIT the drop down with the sample sorting categories we have available
        let sort_dropdown_to_populate = $("#pre_med_card").find(".svg_sort_by");
        for (let i = 0; i < sorting_keys.length; i ++){
            sort_dropdown_to_populate.append(`<a class="dropdown-item" >${sorting_keys[i]}</a>`);
        }
    }else{
        // Hide the card if the data to populate it doesn't exist
        $("#pre_med_card").attr("display", "none");
    }


    //INIT inv profile data for the modal
    //TODO we can work with this for the time being and see how long it takes to process on the
    // large test dataset. If it takes to long then we can switch to the already having the inv values
    // calculated. If it is fast then we no longer need to output the inv values and can save some space
    // DATA for profile inverted
    // Because this dataset is going to be used in the inverted modal plot we need to
    // remove the cummulative y values that have been added to the above
    let data_profile_inv_by_sample = getRectDataProfileBySample();
    function processProfileInvData(data){
        // For each sample in the data
        Object.keys(data).forEach(function (dkey){
            // First check to see if there are any rectangles for this sample
            if (data[dkey].length == 0){
                return;
            }

            // Go through each element removing the cummulative y
            // we can do this by setting the y to 0 for the first element and then
            // for each next element we can set it to the y of the element that is n-1
            new_y_rel = 0;
            new_y_abs = 0;
            for (j = 0; j < data[dkey].length; j++){
                old_y_rel = data[dkey][j]["y_rel"];
                old_y_abs = data[dkey][j]["y_abs"];
                data[dkey][j]["y_rel"] = new_y_rel;
                data[dkey][j]["y_abs"] = new_y_abs;
                new_y_rel = old_y_rel;
                new_y_abs = old_y_abs;
            }

        })
    }
    processProfileInvData(data_profile_inv_by_sample);












    //DATA for btwn sample
    let svg_btwn_sample_dist = d3.select("#chart_btwn_sample");
    let btwn_sample_data_available = false;
    let btwn_sample_genera_coords_data;
    let btwn_sample_genera_pc_variances;
    let available_pcs_btwn_samples;
    let btwn_sample_genera_array;
    let x_btwn_sample;
    let y_btwn_sample;
    let xAxis_btwn_sample;
    let yAxis_btwn_sample;
    // Distance plots heights and widths
    let dist_width = +svg_btwn_sample_dist.attr("width") - margin.left - margin.right;
    let dist_height = +svg_btwn_sample_dist.attr("height") - margin.top - margin.bottom;
    // Set up the zoom object (one for all dist plots)
    let zoom = d3.zoom()
    .scaleExtent([.5, 20])  // This control how much you can unzoom (x0.5) and zoom (x20)
    .extent([[0, 0], [dist_width, dist_height]])
    .on("zoom", update_dist_plot_zoom);
    // Setup the tool tip
    //Dist plot tool tip
    let dist_tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    let sample_list_btwn_sample_dist = {};
    let scatter_btwn_sample;
    if (typeof getBtwnSampleDistCoordsBC === "function") {
        // use the braycurtis objects
        btwn_sample_genera_coords_data = getBtwnSampleDistCoordsBC();
        btwn_sample_genera_pc_variances = getBtwnSampleDistPCVariancesBC();
        available_pcs_btwn_samples = getBtwnSampleDistPCAvailableBC();
        btwn_sample_genera_array = Object.keys(btwn_sample_genera_coords_data);
        btwn_sample_data_available = true;
    }else if(typeof getBtwnProfileDistCoordsUF === "function"){
        // use the unifrac objects
        btwn_sample_genera_coords_data = getBtwnSampleDistCoordsUF();
        btwn_sample_genera_pc_variances = getBtwnSampleDistPCVariancesUF();
        available_pcs_btwn_samples = getBtwnSampleDistPCAvailableUF();
        btwn_sample_genera_array = Object.keys(btwn_sample_genera_coords_data);
        btwn_sample_data_available = true;
    }else{
        // btwn_sample data not available
        // make display none for the btwn sample card
        $("#between_sample_distances").attr("display", "none");
    }
    if (btwn_sample_data_available){
        x_btwn_sample = d3.scaleLinear()
		.range([margin.left, dist_width - margin.right]);
		y_btwn_sample = d3.scaleLinear()
        .rangeRound([dist_height - margin.bottom, margin.top]);
        init_genera_pc_dropdown_dist_plots("#between_sample_distances", btwn_sample_genera_array, available_pcs_btwn_samples);
        // setup the group for holding the axes
        xAxis_btwn_sample = svg_btwn_sample_dist.append("g").attr("class", "grey_axis")
        .attr("transform", `translate(0,${dist_height - margin.bottom})`)
        .attr("id", "x_axis_btwn_sample");
        yAxis_btwn_sample = svg_btwn_sample_dist.append("g").attr("class", "grey_axis")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("id", "y_axis_btwn_sample");
        // Init btwn sample sample list
        for (let i = 0; i < btwn_sample_genera_array.length; i++){
            let genera = btwn_sample_genera_array[i];
            sample_list_btwn_sample_dist[genera] = Object.keys(btwn_sample_genera_coords_data[genera]);
        }
        // Add a clip
        svg_btwn_sample_dist.append("defs").append("clipPath")
        .attr("id", "sample_clip")
        .append("rect")
        .attr("width", dist_width - margin.right - margin.left)
        .attr("height", dist_height - margin.bottom - margin.top)
        .attr("x", margin.left)
        .attr("y", margin.top);

        // This is the group where we will do the drawing and that has the above
        // clipping mask applied to it
        scatter_btwn_sample = svg_btwn_sample_dist.append('g')
        .attr("clip-path", "url(#sample_clip)")

        // Call zoom
        svg_btwn_sample_dist.call(zoom);
    }


    //DATA for btwn profiles
    let svg_btwn_profile_dist = d3.select("#chart_btwn_profile");
    let btwn_profile_data_available = false;
    let btwn_profile_genera_coords_data ;
    let btwn_profile_genera_pc_variances;
    let available_pcs_btwn_profiles;
    let btwn_profile_genera_array;
    let x_btwn_profile;
    let y_btwn_profile;
    let sample_list_btwn_profile_dist = {};
    let xAxis_btwn_profile;
    let yAxis_btwn_profile;
    let scatter_btwn_profile;
    if (typeof getBtwnProfileDistCoordsBC === "function") {
        // use the braycurtis objects
        btwn_profile_genera_coords_data = getBtwnProfileDistCoordsBC();
        btwn_profile_genera_pc_variances = getBtwnProfileDistPCVariancesBC();
        available_pcs_btwn_profiles = getBtwnProfileDistPCAvailableBC();
        btwn_profile_genera_array = Object.keys(btwn_profile_genera_coords_data);
        btwn_profile_data_available = true;
    }else if(typeof getBtwnProfileDistCoordsUF === "function"){
        // use the unifrac objects
        btwn_profile_genera_coords_data = getBtwnProfileDistCoordsUF();
        btwn_profile_genera_pc_variances = getBtwnProfileDistPCVariancesUF();
        available_pcs_btwn_profiles = getBtwnProfileDistPCAvailableUF();
        btwn_profile_genera_array = Object.keys(btwn_profile_genera_coords_data);
        btwn_profile_data_available = true;
    }else{
        // btwn_sample data not available
        // make display none for the btwn sample card
        $("#between_sample_distances").attr("display", "none");
    }
    if (btwn_profile_data_available){
        x_btwn_profile = d3.scaleLinear()
		.range([margin.left, dist_width - margin.right]);
		y_btwn_profile = d3.scaleLinear()
        .rangeRound([dist_height - margin.bottom, margin.top]);
        init_genera_pc_dropdown_dist_plots("#between_profile_distances", btwn_profile_genera_array, available_pcs_btwn_profiles);
        // The group for holding the axes
        xAxis_btwn_profile = svg_btwn_profile_dist.append("g").attr("class", "grey_axis")
        .attr("transform", `translate(0,${dist_height - margin.bottom})`)
        .attr("id", "x_axis_btwn_profile");
        yAxis_btwn_profile = svg_btwn_profile_dist.append("g").attr("class", "grey_axis")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("id", "y_axis_btwn_profile");
        // Init the btwn_sample profile list
        for (let i = 0; i < btwn_profile_genera_array.length; i++){
            let genera = btwn_profile_genera_array[i];
            sample_list_btwn_profile_dist[genera] = Object.keys(btwn_profile_genera_coords_data[genera]);
        }
        // Add a clip
        svg_btwn_profile_dist.append("defs").append("clipPath")
        .attr("id", "profile_clip")
        .append("rect")
        .attr("width", dist_width - margin.right - margin.left)
        .attr("height", dist_height - margin.bottom - margin.top)
        .attr("x", margin.left)
        .attr("y", margin.top);

        // This is the group where we will do the drawing and that has the above
        // clipping mask applied to it
        scatter_btwn_profile = svg_btwn_profile_dist.append('g')
        .attr("clip-path", "url(#profile_clip)")

        svg_btwn_profile_dist.call(zoom);
    }


    // Init the text value of the genera_identifier in each of the distance plots
    // INIT the genera drop down
    // INIT the PC drop down
    function init_genera_pc_dropdown_dist_plots(card_id, genera_present, pcs_available){
        let genera_array = ['Symbiodinium', 'Breviolum', 'Cladocopium', 'Durusdinium'];
        let card_element = $(card_id);
        let first_genera_present;
        for (let j = 0; j < genera_array.length; j++) {
            // init the genera_indentifier with the first of the genera in the genera_array that we have data for
            // We only want to do this for the first genera that we find so we check whether the data-genera attribute
            // already has been set or not.
            if (genera_present.includes(genera_array[j])){
                let attr = card_element.find(".genera_identifier").attr("data-genera");
                if (typeof attr !== typeof undefined && attr !== false) {
                    // then already set. just add genera link
                    card_element.find(".genera_select").append(`<a class="dropdown-item" style="font-style:italic;">${genera_array[j]}</a>`);
                }else{
                    // then genera_identifier not set
                    card_element.find(".genera_identifier").text(genera_array[j]);
                    card_element.find(".genera_identifier").attr("data-genera", genera_array[j]);
                    card_element.find('.genera_select').append(`<a class="dropdown-item" style="font-style:italic;">${genera_array[j]}</a>`);
                    first_genera_present = genera_array[j];
                }
            }
        }
        let pcs_available_genera = pcs_available[first_genera_present];
        // Skip the first PC as we don't want PC1 in the options
        for (let j = 1; j < pcs_available_genera.length; j++){
            card_element.find(".pc_select").append(`<a class="dropdown-item" data-pc="${pcs_available[j]}">${pcs_available_genera[j]}</a>`)
        }
    }


    // Set the colour scale
    // We can set both the range and domain of this as these are invariable between absolute and relative
    // data types
    //TODO synchronise the colour scales between the pre- and post-med seqs.
    // The fill colours of the rect objects are now already in the array of objects
    //TODO we will need to have color scales for the distance plots as these will vary depending on
    // the property that we are colouring by.
    let seq_color = getSeqColor();
    let seq_names = Object.keys(seq_color);
    let seq_colors = seq_names.map(function(seq_name){return seq_color[seq_name]});
    let sequence_color_scale = d3.scaleOrdinal().domain(seq_names).range(seq_colors);

    let prof_color = getProfColor();
    let prof_names = Object.keys(prof_color);
    let prof_colors = seq_names.map(function(seq_name){return seq_color[seq_name]});
    let profile_color_scale = d3.scaleOrdinal().domain(prof_names).range(prof_colors);


    // INIT the post-MED and profile plots modal and normal.
    let data_type;
    if ($("#PostMEDAbsDType").hasClass("btn-primary")){
            data_type = 'absolute';
        } else if ($("#PostMEDRelDType").hasClass("btn-primary")){
            data_type = 'relative';
        }

    // POST-MED INIT
    update_bar_plot_by_sample(data_type, "post", sample_list_post, post_med_init_by_sample_interval);

    // POST-MED-MODAL INIT
    update_bar_plot_by_sample(data_type, "post-modal", sample_list_modal, post_med_init_by_sample_interval);

    // PROFILES INIT
    update_bar_plot_by_sample(data_type, "profile", sample_list_profile, profile_init_by_sample_interval);

    // PROFILES-MODAL INIT
    update_bar_plot_by_sample(data_type, "profile-modal", sample_list_modal, profile_init_by_sample_interval);

    // BTWN SAMPLE INIT
    update_dist_plot("#chart_btwn_sample");

    // BTWN SAMPLE INIT
    update_dist_plot("#chart_btwn_profile");

    // Functions for doing the init and updating of the d3 bar plots
    function update_bar_plot_by_sample(data_type, pre_post_profile, sample_list, init_sample_interval){
        // Update the domains first
        update_axis_domains_by_sample(data_type, pre_post_profile)
        // then plot the bars sample by sample
        cum_time = 0
        for(let i = 0; i < sample_list.length; i++){
             setTimeout(update_by_sample, i * init_sample_interval, sample_list[i],
             data_type, init_sample_interval, pre_post_profile);
             cum_time += init_sample_interval;
        }
        // Now draw the axis last so that they are on top of the bars
        // we can then use a transition .on event to call the centering of the labels
        setTimeout(call_axes, cum_time, 1000, pre_post_profile)

        // Finally if this is the inv profile modal plot we need to draw on the path manually
        // as the bars are obscuring it for some reason
        if (pre_post_profile == "profile-modal"){
            let d_str = "M" + (inv_prof_margin.left + 0.5).toString() +
            "," + (inv_prof_margin.top + 0.5).toString() + "H" +
            (+svg_post_med.attr("width") - inv_prof_margin.left - inv_prof_margin.right + 0.5).toString();

            svg_profile_modal.append("path").attr("stroke", "black").attr("d", d_str);
        }
    }

    function update_axis_domains_by_sample(data_type, pre_post_profile){
        // Update the Y scale's domain depending on whether we are doing absolute or relative data_type
        let y;
        let x;
        let max_y;
        let sample_list;
        if (pre_post_profile == "post"){
            y = y_post_med;
            x = x_post_med;
            max_y = max_y_val_post_med;
            sample_list = sample_list_post.map(function(sample_uid){
                return sample_meta_info[sample_uid]["sample_name"];
            });
        }else if (pre_post_profile == "post-modal"){
            y = y_post_modal;
            x = x_modal;
            max_y = max_y_val_post_med;
            sample_list = sample_list_modal.map(function(sample_uid){
                return sample_meta_info[sample_uid]["sample_name"];
            });
        }else if (pre_post_profile == "pre"){
            y = y_pre_med;
            x = x_pre_med;
            max_y = max_y_val_pre_med;
            sample_list = sample_list_pre.map(function(sample_uid){
                return sample_meta_info[sample_uid]["sample_name"];
            });
        }else if (pre_post_profile == "profile"){
            y = y_profile;
            x = x_profile;
            max_y = max_y_val_profile;
            sample_list = sample_list_profile.map(function(sample_uid){
                return sample_meta_info[sample_uid]["sample_name"];
            });
        }else if (pre_post_profile == "profile-modal"){
            y = y_profile_modal;
            x = x_profile;
            max_y = max_y_val_profile;
            sample_list = sample_list_modal.map(function(sample_uid){
                return sample_meta_info[sample_uid]["sample_name"];
            });
        }

        if (data_type == "absolute"){
            y.domain([0, max_y]).nice();
        }else{
            y.domain([0, 1]).nice();
        }

        // Set the domain of the x. This should be the sample names
        x.domain(sample_list);

    }

    function update_by_sample(col_sample, data_type, speed, pre_post_profile){

        let svg;
        let data_by_sample;
        let delay = 0.1;
        let col_scale;
        let x_key = sample_meta_info[col_sample]["sample_name"];
        if (pre_post_profile == "post-modal"){
            data_by_sample = data_post_med_by_sample;
            svg = svg_post_med_modal;
            x = x_modal;
            y = y_post_modal;
            col_scale = sequence_color_scale;
        }else if (pre_post_profile == "post"){
            data_by_sample = data_post_med_by_sample;
            svg = svg_post_med;
            x = x_post_med;
            y = y_post_med;
            col_scale = sequence_color_scale;
        }else if (pre_post_profile == "pre"){
            svg = svg_pre_med;
            data_by_sample = data_pre_med_by_sample;
            x = x_pre_med;
            y = y_pre_med;
        }else if (pre_post_profile == "profile"){
            svg = svg_profile;
            data_by_sample = data_profile_by_sample;
            x = x_profile;
            y = y_profile;
            col_scale = profile_color_scale;
        }else if (pre_post_profile == "profile-modal"){
            svg = svg_profile_modal;
            data_by_sample = data_profile_inv_by_sample;
            x = x_profile;
            y = y_profile_modal;
            col_scale = profile_color_scale;
        }

        let bars = svg.select("g.s" + col_sample).selectAll("rect").data(data_by_sample[col_sample], function(d){
            // In theory because we're working on a sample by sample basis now we should be able to work with just the
            // the seq name as key. But for the time being we'll keep the key as it is.
            if (pre_post_profile == "profile" || pre_post_profile == "profile-modal"){
                return d.profile_name;
            }else{
                return d.seq_name;
            }

        });

        bars.exit().remove()

        let abbr;
        if (data_type == 'absolute'){
            //if 'absolute' then use the abbreviation 'abs' for getting the attributes
            abbr = 'abs'
        }else if (data_type == 'relative'){
            // if 'relative' then use the abbreviation 'rel' for getting the attributes
            abbr = 'rel'
        }

        if (pre_post_profile == "profile-modal"){
            bars.transition().duration(speed).attr("x", function(d){
                return x(x_key);
            }).attr("y", function(d){
                return y(+d["y_" + abbr]);
            }).attr("width", x.bandwidth()).attr("height", function(d){
                return Math.max(y(+d["height_" + abbr]), 1);
            }).attr("fill", function(d){
                return col_scale(d.profile_name);
            }).delay(function(d,i){return(i*delay)});
        }else if (pre_post_profile == "profile"){
            bars.transition().duration(speed).attr("x", function(d){
                return x(x_key);
            }).attr("y", function(d){
                return y(+d["y_" + abbr]);
            }).attr("width", x.bandwidth()).attr("height", function(d){
                return Math.max(y(0) - y(+d["height_" + abbr]), 1);
            }).attr("fill", function(d){
                return col_scale(d.profile_name);
            }).delay(function(d,i){return(i*delay)});
        }else{
            bars.transition().duration(speed).attr("x", function(d){
                return x(x_key);
            }).attr("y", function(d){
                return y(+d["y_" + abbr]);
            }).attr("width", x.bandwidth()).attr("height", function(d){
                return Math.max(y(0) - y(+d["height_" + abbr]), 1);
            }).attr("fill", function(d){
                return col_scale(d.seq_name);
            }).delay(function(d,i){return(i*delay)});
        }


        // Interesting article on the positioning of the .on method
        // https://stackoverflow.com/questions/44495524/d3-transition-not-working-with-events?rq=1
        // We need to have separate updates for each of the profile, profile-modal and all others,
        // ys that we will be using and the tips that we will be showing.
        if (pre_post_profile == "profile"){
            bars.enter().append("rect")
            .attr("x", function(d){
                return x(x_key);
            }).attr("y", y(0)).on('mouseover', function(d){
                tip_profiles.show(d);
                d3.select(this).attr("style", "stroke-width:1;stroke:rgb(0,0,0);");
                $(this).closest(".card").find(".meta_profile_name").text(d["profile_name"]);
            })
            .on('mouseout', function(d){
                tip_profiles.hide(d);
                d3.select(this).attr("style", null);
            }).transition().duration(1000).attr("y", function(d){
                return y(+d["y_" + abbr]);
            }).attr("width", x.bandwidth()).attr("height", function(d){
                return Math.max(y(0) - y(+d["height_" + abbr]), 1);}
            ).attr("fill", function(d){
                return col_scale(d.profile_name);
            });
        }else if(pre_post_profile == "profile-modal"){
            bars.enter().append("rect")
            .attr("x", function(d){
                return x(x_key);
            }).attr("y", y(0)).on('mouseover', function(d){
                tip_profiles.show(d);
                d3.select(this).attr("style", "stroke-width:1;stroke:rgb(0,0,0);");
                $(this).closest(".card").find(".meta_profile_name").text(d["profile_name"]);
            })
            .on('mouseout', function(d){
                tip_profiles.hide(d);
                d3.select(this).attr("style", null);
            }).transition().duration(1000).attr("y", function(d){
                return y(+d["y_" + abbr]);
            }).attr("width", x.bandwidth()).attr("height", function(d){
                return Math.max(y(+d["height_" + abbr]), 1);
            }).attr("fill", function(d){
                return col_scale(d.profile_name);
            });
        }else{
            bars.enter().append("rect")
            .attr("x", function(d){
                return x(x_key);
            }).attr("y", y(0)).on('mouseover', function(d){
                tip_seqs.show(d);
                d3.select(this).attr("style", "stroke-width:1;stroke:rgb(0,0,0);");
            })
            .on('mouseout', function(d){
                tip_seqs.hide(d);
                d3.select(this).attr("style", null);
            }).transition().duration(1000).attr("y", function(d){
                return y(+d["y_" + abbr]);
            }).attr("width", x.bandwidth()).attr("height", function(d){
                return Math.max(y(0) - y(+d["height_" + abbr]), 1);}
            ).attr("fill", function(d){
                return col_scale(d.seq_name);
            });
        }
    }

    function call_axes(speed, pre_post_profile){
        // Update the Y scale's domain depending on whether we are doing absolute or relative data_type
        if (pre_post_profile == "post"){
            y = y_post_med;
            x = x_post_med;
            y_axis_id = "#y_axis_post_med";
            x_axis_id = "#x_axis_post_med";
        }else if (pre_post_profile == "post-modal"){
            y = y_post_modal;
            x = x_modal;
            y_axis_id = "#y_axis_post_med_modal";
            x_axis_id = "#x_axis_post_med_modal";
        }else if (pre_post_profile == "pre"){
            y = y_pre_med;
            x = x_pre_med;
            y_axis_id = "#y_axis_pre_med";
            x_axis_id = "#x_axis_pre_med";
        }else if (pre_post_profile == "profile"){
            y = y_profile;
            x = x_profile;
            y_axis_id = "#y_axis_profile";
            x_axis_id = "#x_axis_profile";
        }else if (pre_post_profile == "profile-modal"){
            y = y_profile_modal;
            x = x_profile;
            y_axis_id = "#y_axis_profile_modal";
            x_axis_id = "#x_axis_profile_modal";
        }

        // Call the y axis
        d3.select(y_axis_id)
        .transition()
        .duration(speed)
        .call(d3.axisLeft(y).ticks(null, "s"));

        // Call the x axis
        if (pre_post_profile == "profile-modal"){
            // Axis with ticks above and no text
            d3.select(x_axis_id).transition().duration(speed)
                    .call(d3.axisTop(x).tickSizeOuter(0));

        }else if (pre_post_profile == "post-modal") {
            // Axis with the centered labels
            // Has callback to center the labels
            d3.selectAll(x_axis_id).transition().duration(speed)
                    .call(d3.axisBottom(x).tickSizeOuter(0)).selectAll("text")
                    .attr("y", 0).attr("x", 9).attr("dy", ".35em").attr("transform", "rotate(90)")
                    .style("text-anchor", "start").style("text-anchor", "start")
                    .on("end", centerAlignXLabels);
        }else{
            // The regular axis with ticks and text below
            // no call back to center the labels
            d3.selectAll(x_axis_id).transition().duration(speed)
                    .call(d3.axisBottom(x).tickSizeOuter(0)).selectAll("text")
                    .attr("y", 0).attr("x", 9).attr("dy", ".35em").attr("transform", "rotate(90)")
                    .style("text-anchor", "start").style("text-anchor", "start");
        }

        // Listener to highlight sample names on mouse over.
        // Not needed for the post-2
        if (pre_post_profile !== "profile-modal"){
            let ticks = d3.select(x_axis_id).selectAll(".tick")._groups[0].forEach(function(d1){
                d3.select(d1).on("mouseover", function(){
                    d3.select(this).select("text").attr("fill", "blue").attr("style", "cursor:pointer;text-anchor: start;");
                    let sample_name = this.__data__;
                    $(this).closest(".card").find(".meta_sample_name").text(sample_name);
                }).on("mouseout", function(){
                    d3.select(this).select("text").attr("fill", "black").attr("style", "cursor:auto;text-anchor: start;");
                })
            })
        }
    }

    // Functions for doing the init and updating of the d3 dist plots
    function update_dist_plot(dist_plot_id){
        let svg;
        let scatter;
        let coords;
        let pc_variances;
        let first_pc_variance;
        let second_pc_variance;
        let pcs_available;
        let sample_array;
        let second_pc;
        let genera;
        let x_scale;
        let y_scale;
        let data = [];
        let x_axis_id;
        let y_axis_id;

        //TODO this will need updating to include the profile distances and the modals
        // but to save dev time we will try to get the scatter working with just this one first
        switch(dist_plot_id){
            // I think we should simplify the data here according to the various selections that have been made
            // The first will be to look at genera, then PC. The colour will be done using the colour scale eventually
            // but first I will just do this as black and we can dev this later.
            // We want to end up with two arrays, one for the x and one for the y
            case "#chart_btwn_sample":
                svg = svg_btwn_sample_dist;
                scatter = scatter_btwn_sample;
                pc_variances = btwn_sample_genera_pc_variances;

                x_axis_id = "#x_axis_btwn_sample";
                y_axis_id = "#y_axis_btwn_sample";
                // get the genera
                // NB the genera identifier is updated from the click of the genera drop down or
                // as part of the init.
                genera = $(dist_plot_id).closest(".card").find(".genera_identifier").attr("data-genera");
                pcs_available = available_pcs_btwn_samples[genera];
                sample_array = sample_list_btwn_sample_dist[genera];
                coords = btwn_sample_genera_coords_data[genera];
                x_scale = x_btwn_sample;
                y_scale = y_btwn_sample;
                break;
            case "#chart_btwn_profile":
                svg = svg_btwn_profile_dist;
                scatter = scatter_btwn_profile;
                pc_variances = btwn_profile_genera_pc_variances;
                x_axis_id = "#x_axis_btwn_profile";
                y_axis_id = "#y_axis_btwn_profile";
                // get the genera
                // NB the genera identifier is updated from the click of the genera drop down or
                // as part of the init.
                genera = $(dist_plot_id).closest(".card").find(".genera_identifier").attr("data-genera");
                pcs_available = available_pcs_btwn_profiles[genera];
                sample_array = sample_list_btwn_profile_dist[genera];
                coords = btwn_profile_genera_coords_data[genera];
                x_scale = x_btwn_profile;
                y_scale = y_btwn_profile;
                break;
        }

        // get the second PC from the PC selector
        let pc_selector_text = $(dist_plot_id).closest(".card-body").find(".pc_selector").attr("data-pc");
        if ( pc_selector_text == "PC:"){second_pc="PC2";}else{second_pc=pc_selector_text;}

        first_pc_variance = pc_variances[genera][pcs_available.indexOf("PC1")];
        second_pc_variance = pc_variances[genera][pcs_available.indexOf(second_pc)];

        // Populate the data array that will be used for plotting
        for (let i = 0; i < sample_array.length; i++){
            let sample = sample_array[i]
            data.push({
                sample_name:sample,
                x : +coords[sample]["PC1"],
                y : +coords[sample][second_pc]
            })
        }

        let min_x = d3.min(data, d => +d.x);
        let max_x = d3.max(data, d => +d.x);
        let min_y = d3.min(data, d => +d.y);
        let max_y = d3.max(data, d => +d.y);

        // A buffer so that the points don't fall exactly on the axis lines
        let x_buffer = (max_x - min_x) * 0.05;
        let y_buffer = (max_y - min_y) * 0.05;

        x_scale.domain([min_x - x_buffer, max_x + x_buffer]);
        y_scale.domain([min_y - y_buffer, max_y + y_buffer]);

        d3.select(x_axis_id)
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x_scale).ticks(0));

        d3.select(y_axis_id)
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y_scale).ticks(0));

        // Here do the plotting of the scatter
        let dots = scatter.selectAll("circle").data(data, function(d) {
            return d.sample_name;
        } );

        // Place any new scatter points
        //TODO we can add more info to the tool tip like absolute and relative abundances of the samples or profiles
        dots.enter().append("circle").attr("class", "dot").attr("r", 3.5).attr("cx", function(d){
            return x_scale(d.x);
        }).attr("cy", d => y_scale(d.y))
        .style("fill", "rgba(0,0,0,0.5)")
        .on("mouseover", function(d) {
          dist_tooltip.transition().duration(200).style("opacity", .9);
          dist_tooltip.html(d.sample_name).style("left", (d3.event.pageX + 5) + "px").style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
              dist_tooltip.transition().duration(500).style("opacity", 0);
          });

        // Update any changes to points that already exist
        dots.transition().duration(2000).attr("cx", d => x_scale(d.x)).attr("cy", d => y_scale(d.y))
        .style("fill", "rgba(0,0,0,0.5)");

        // Remove points
        dots.exit().remove()

        // Y axis title
        //we need to be able to change the axis titles so we will give them ids and then
        // check to see if they exist. if they do, simply change text otherwise make from scratch
        let text_x = 15;
        let text_y = dist_height/2;
        let y_axis_selection = $(dist_plot_id).find(".y_axis_title")
        if (y_axis_selection.length){
            // Then the y axis title exists. Change the text of this axis
            y_axis_selection.text(`PC1 - ${Number.parseFloat(first_pc_variance*100).toPrecision(2)}%`)
        }else{
            // yaxis doesn't exist. make from scratch
            svg.append("text").attr("class", "x_axis_title")
            .attr("y", text_y)
            .attr("x", text_x)
            .attr("dy", "1em").attr("font-size", "0.8rem")
            .style("text-anchor", "middle")
            .text(`PC1 - ${Number.parseFloat(first_pc_variance*100).toPrecision(2)}%`)
            .attr("transform", `rotate(-90, ${text_x}, ${text_y})`);
        }

        // X axis title
        text_x = dist_width/2;
        text_y = dist_height -15;
        let x_axis_selection = $(dist_plot_id).find(".y_axis_title")
        if (x_axis_selection.length){
            // Then the y axis title exists. Change the text of this axis
            x_axis_selection.text(`${second_pc} - ${Number.parseFloat(first_pc_variance*100).toPrecision(2)}%`)
        }else{
            // yaxis doesn't exist. make from scratch
            svg.append("text").attr("class", "y_axis_title")
            .attr("y", text_y)
            .attr("x", text_x)
            .attr("dy", "1em").attr("font-size", "0.8rem")
            .style("text-anchor", "middle")
            .text(`${second_pc} - ${Number.parseFloat(second_pc_variance*100).toPrecision(2)}%`);
        }

    }

    function update_dist_plot_zoom(){
        let newX;
        let newY;
        let scatter;
        let x_axis_id;
        let y_axis_id;
        if (this.id.includes("sample")){
            // recover the new scale
            newX = d3.event.transform.rescaleX(x_btwn_sample);
            newY = d3.event.transform.rescaleY(y_btwn_sample);
            x_axis_id = "#x_axis_btwn_sample";
            y_axis_id = "#y_axis_btwn_sample";
            scatter = scatter_btwn_sample;
        }else{
            // recover the new scale
            newX = d3.event.transform.rescaleX(x_btwn_profile);
            newY = d3.event.transform.rescaleY(y_btwn_profile);
            x_axis_id = "#x_axis_btwn_profile";
            y_axis_id = "#y_axis_btwn_profile";
            scatter = scatter_btwn_profile;
        }
        // update axes with these new boundaries
        d3.select(x_axis_id).call(d3.axisBottom(newX).ticks(0));
        d3.select(y_axis_id).call(d3.axisLeft(newY).ticks(0));

        // update circle position
        scatter.selectAll("circle").attr('cx', function(d) {return newX(d.x)}).attr('cy', function(d) {return newY(d.y)});
    }

	// LISTENERS RELATED TO CHARTING
	// RELATIVE to ABSOLUTE switch
	// When we change the modal or regular version we want these changes relected in the other.
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
            // If one of the modal buttons then need to update both plots
            // else just the one plot.
            let pre_post_profile = $(this).attr("data-data-type")
            let sample_list;
            let init_speed;
            if (pre_post_profile == "post-profile"){
                // Update post modal
                update_bar_plot_by_sample($(this).text(), "post-modal",
                sample_list_modal, post_med_init_by_sample_interval);
                // Update profile modal
                update_bar_plot_by_sample($(this).text(), "profile-modal",
                sample_list_modal, profile_init_by_sample_interval);
            }else{
                switch(pre_post_profile){
                    case "post":
                        sample_list = sample_list_post;
                        init_speed = post_med_init_by_sample_interval;
                        break;
                    case "pre":
                        sample_list = sample_list_pre;
                        init_speed = pre_med_init_by_sample_interval;
                        break;
                    case "profile":
                        sample_list = sample_list_profile;
                        init_speed = profile_init_by_sample_interval;
                        break;
                }
                update_bar_plot_by_sample($(this).text(), pre_post_profile, sample_list, init_speed);
            }


        }
    });

    // Listening for INIT of pre-MED seqs plot
    // We want to have a listener for the Pre-MED header opening up. When this happens, we will want to plot the
    // pre-med plot, we will also want to remove the rendering the pre-MED seqs text. Also a good idea will be to have
    // a spinner set off in the top right corner.
    $('#pre_med_svg_collapse').on('show.bs.collapse', function(){
        // First check to see if the pre-MED svg has already been initiated. If so then there is nothing
        // to do here.
        //TODO implement the spinner and get rid of the text when open
        if (!$("#chart_pre_med").hasClass("init")){
            $("#chart_pre_med").attr("class", "init");
            //Plot as relative or absolute abundances according to which button is currently primary
            if($("#PreMEDRelDType").hasClass("btn-primary")){
                let data_type = "relative";
            }else{
                let data_type = "absolute";
            }

            //Now do the init of the pre-MED svg
            svg_pre_med = d3.select("#chart_pre_med");

            // Set the x range that will be used for the x val of the bars
            x_pre_med = d3.scaleBand()
            .range([margin.left, seq_prof_width - margin.right])
            .padding(0.1)

            // Set the y range
            y_pre_med = d3.scaleLinear()
            .rangeRound([seq_prof_height - margin.bottom, margin.top])

            //Set up the svg element in which we will call the axis objects
            xAxis_pre_med = svg_pre_med.append("g")
            .attr("transform", `translate(0,${seq_prof_height - margin.bottom})`)
            .attr("id", "x_axis_pre_med")

            yAxis_pre_med = svg_pre_med.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .attr("id", "y_axis_pre_med")

            //Add a g to the svgs that we will use for the bars
            //We will have a seperate g for each of the samples so that we can hopefully plot column by column
             sample_list_pre.forEach(function(sample){
                svg_pre_med.append("g").attr("class", "s" + sample)
             });

            update_bar_plot_by_sample(data_type, "pre", sample_list_pre, pre_med_init_by_sample_interval)


        }

    });

    // Listening for the bar chart sorting button clicks
    $(".svg_sort_by a").click(function(){
        let current_text = $(this).closest(".btn-group").find(".btn").text();
        let selected_text = $(this).text()
        // Only proceed if the button text has changed
        if (current_text !== selected_text){
            $(this).closest(".btn-group").find(".btn").text(selected_text);

            let data_type;
            let pre_post_profile;
            let sample_list;
            let init_speed;
            $(this).closest(".btn-group-sm").find(".dtype-btn").each(function(){
                // We need to infer the rel_abs from the primary coloured button
                if ($(this).hasClass("btn-primary")){
                    pre_post_profile = $(this).attr("data-data-type");
                    data_type = $(this).text();
                }

            });

            //TODO perform sorting here.
            // In place of getting a new sample order for real we will simply
            // reverse the current one
            if (pre_post_profile == "post-profile"){
                // Then this is the modal being re-sorted
                sample_list_modal = sorted_sample_uid_arrays[selected_text];
                // Update post modal
                update_bar_plot_by_sample(data_type, "post-modal",
                sample_list_modal, post_med_init_by_sample_interval);
                // Update profile modal
                update_bar_plot_by_sample(data_type, "profile-modal",
                sample_list_modal, profile_init_by_sample_interval);
            }else{
                // Then this is not the modal being re-sorted
                switch (pre_post_profile){
                    case "post":
                        sample_list_post = sorted_sample_uid_arrays[selected_text];
                        sample_list = sample_list_post;
                        init_speed = post_med_init_by_sample_interval;
                        break;
                    case "pre":
                        sample_list_pre = sorted_sample_uid_arrays[selected_text];
                        sample_list = sample_list_pre;
                        init_speed = pre_med_init_by_sample_interval;
                        break;
                    case "profile":
                        sample_list_profile = sorted_sample_uid_arrays[selected_text];
                        sample_list = sample_list_profile;
                        init_speed = profile_init_by_sample_interval;
                        break;
                }
                update_bar_plot_by_sample(data_type, pre_post_profile, sample_list, pre_med_init_by_sample_interval)

            }
        }

    });

    // Listenting for the PC change on the distance plots
    $(".pc_select a").click(function(){
        let pc_button = $(this).closest(".btn-group").find(".btn")
        let current_pc = pc_button.attr("data-pc");
        let selected_pc = $(this).attr("data-pc")

        if (current_pc !== selected_pc){
            pc_button.text(selected_pc);
            pc_button.attr("data-pc", selected_pc);

            // We need to get the chart is
            // TODO eventually we will want to link this into the modal as well so that it mirrors the non-modal
            chart_id = '#' + pc_button.closest('.card').find('.chart').attr("id");

            update_dist_plot(chart_id);
        }
    });

    //INIT MAP
    function initMap() {

        let location = new google.maps.LatLng(22.193730, 38.957069);

        let mapCanvas = document.getElementById('map');
        let mapOptions = {
            center: location,
            zoom: 10,
            panControl: false,
            mapTypeId: google.maps.MapTypeId.SATELLITE
        }
        let map = new google.maps.Map(mapCanvas, mapOptions);


        let contentString = '<div >' +
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

        let marker_data = [{'lat': 22.235196, 'lng': 39.006563, 'label': "reef_1"}, {'lat': 22.190266, 'lng': 38.978879, 'label': "reef_2"}]

        let infowindow = new google.maps.InfoWindow({
          content: contentString
        });

        marker_data.forEach(function(data){
            let marker =  new google.maps.Marker({
            position: {lat: data['lat'], lng: data['lng']},
            map:map
            });

            marker.addListener('click', function() {
                infowindow.open(map, marker);
            });
        });
//        let first_marker = new google.maps.Marker({position: {lat: 22.235196, lng: 39.006563}, map:map, label:"reef_two"})
//        let second_marker = new google.maps.Marker({position: {lat: 22.190266, lng: 38.978879}, map:map, label:"Thuwal"})

//        let markerCluster = new MarkerClusterer(map, map_markers,
//            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});

    }

    google.maps.event.addDomListener(window, 'load', initMap);


    function centerAlignXLabels(){
        // This function aims to move the text labels down slightly
        // to align them vertically centrally.
        // Only those labels shorter than others need moving
        // We use the bottom of the bounding box of the axis (svg g element)
        // We calculate the distance between the bottom of the text element
        // and this g box and then move it down by half of this.
        // UPDATE: because the modal hasn't appeared yet we the method below
        // doesn't work because there are no bounding boxes yet.
        //TODO fix this.
        $('#x_axis_post_med_modal').find('text').each(function(){
            let text_current_x = +$(this).attr("x");
            let g_bbox_height = $("#x_axis_post_med_modal")[0].getBoundingClientRect().height;
            let text_bbox_height_inc_tick = this.getBBox().width + text_current_x;
            let distance_btwn_g_and_text = g_bbox_height - text_bbox_height_inc_tick;
            // I have no idea why I have to divide by four here, but dividing by two
            // and adding this to the attributes was moving it all the way to the bottom.
            let dist_to_move = distance_btwn_g_and_text/4;
            if (dist_to_move > 1){
                let new_x = (text_current_x + dist_to_move).toString();
                $(this).attr("x", new_x);
            }

        });
    }

});






