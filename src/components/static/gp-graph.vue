<style>



</style>

<template>

<el-container>
    <apexchart width="500" type="treemap" :options="chartOptions" :series="series"></apexchart>
</el-container>

</template>

<script>

export default {
    name: 'gp-chart',
    data: function() {
        return {
            chartOptions: {
                chart: {
                    height: 350,
                    type: "treemap",
                }
            },
            series: [{
                data: [{
                    x: "New Delhi",
                    y: 218,
                }, {
                    x: "Kolkata",
                    y: 149,
                }, {
                    x: "Mumbai",
                    y: 184,
                }, {
                    x: "Ahmedabad",
                    y: 55,
                }, {
                    x: "Bangaluru",
                    y: 84,
                }, {
                    x: "Pune",
                    y: 31,
                }, {
                    x: "Chennai",
                    y: 70,
                }],
            }, ]
        };
    }
}

</script>
