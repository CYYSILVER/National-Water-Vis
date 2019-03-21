
	d3.json("./json/china.geojson").then(function(data){
		
		console.log("dataset",data)
		
	/*=========================================中国地图svg======================================START*/
		var svgMapWidth = 1280;
		var svgMapHeight = 620;
		
		
		
		
		
		//投影
		var projection = d3.geoMercator()
	    	.fitExtent([[10, 10], [svgMapWidth-10, svgMapHeight-10]], data);
		//console.log("project",projection);
	    	
	    //路径生成器	
		var path = d3.geoPath().projection(projection);
		//console.log("path",path);
	
		//缩放生成器
		var maxZoom = 100;
		var zoom = d3.zoom()
			.scaleExtent([1,maxZoom])
			.translateExtent([[0,0],[svgMapWidth,svgMapHeight]])
			.on("zoom",zoomed);
		
		//中国地图div
		var divCNMap = d3.select("body")
		  .append("div")
		    .attr("id","div1")
		  .append("div")
			.attr("class","chinaMap")
			
		
		//左上角tooltip
		var divTooltip = divCNMap.append("div")
    		.attr("class", "tooltip")
    		.style("opacity", 0);

		//中国地图svg
		var svgCNMap = divCNMap
		  .append("svg")
			.attr("class","chinaMapsvg")
			.attr("width",svgMapWidth)
			.attr("height",svgMapHeight);
		
				
		//地图 group
		var colorMapSelected = "#d7fbf9";
		var colorMapOrigin = "#c1f5de";
//		console.debug(colorMapOrigin);
		var gMap = svgCNMap.append("g")
			.attr("class","gMap")
			.selectAll("path")
		    .data(data.features)
		    .enter()
		  .append("path")
		  	.attr("d",path)
		  	.attr("title",function(d){
		  		return d.properties["name"];
		  	})
		  	.on("mouseover",function(d){
		  		
		  		d3.select(this)
		  			.style("fill",colorMapSelected)

		  		var name = "#"+d.properties["name"]
		  		var text = d3.select(name)
		  			.style("font-size",14)
		  			.style("fill","black")
		  			.style("fill-opacity",0.7)
		  			
		  		//省份名字的放大和缩小
		  	})
		  	.on("mouseout",function(d){
		  		
		  		
		  		d3.select(this)
		  			.style("fill",colorMapOrigin)
		  		var name = "#"+d.properties["name"]
		  		d3.select(name)
		  			.style("font-size",12)
		  			.style("fill","#392e85")
		  			.style("fill-opacity",0.2)


		  	})
		
		
		
		//所有省份的text
		var gNameAll = svgCNMap.append("g")
			.attr("class","provinceName")
		  .selectAll("text")
			.data(data.features)
			.enter()
		  .append("text")
		  	.attr("id",function(d){
		  		return d.properties.name;
		  	})
		  	.attr("transform",function(d){
		  		var point = path.centroid(d);
		  		if(d.properties.name == "河北"){
		  			point[0] -= 15;
		  		}
		  		return "translate("+point+")";
		  	})
		  	.attr("data-origin",function(d){
		  		var point = path.centroid(d);
		  		if(d.properties.name == "河北"){
		  			point[0] -= 15;
		  		}
		  		return point;
		  	})
		  	.text(function(d){
		  		return d.properties.name;
		  	})
		
		
		
		//数据 group
		var gData = svgCNMap.append("g")
					.attr("class","gLoc")
		
		
		//所有数据
		var gDataAll = gData.selectAll("circle")	
	
		d3.csv("./res/国控地表水监测站基础信息.csv").then(function(locData){
			//console.debug("国控地表水监测站基础信息",locData);
			var tooltip;
			
			var sizeSelected = 15;
			var sizeNormal = 5;
			
			var colorSelected = "#ffffff"
			
			//颜色数组
			var colorScheme = d3.schemeCategory10;
			//映射关系
			var colorMap = d3.map()
				.set("长江",0)
				.set("黄河",1)
				.set("辽河",2)
				.set("珠江",3)
				.set("淮河",4)
				.set("松花江",5)
				.set("太湖",6)
				.set("西南诸河",7)
				.set("其他",9)
			
			//legend Vertical标注	
			var legendMap = colorMap.keys();
			var legendMargin = {left:20,bottom:20,all:5};
			var leSize = 25;
			var leLength = colorMap.size() *(leSize +legendMargin.all) ;
			
			var legend = svgCNMap.append("g")
				.attr("class","legend")
			
			
			
			legend.selectAll("rect")
				.data(legendMap)
				.enter()
				.append("rect")
				.attr("x",legendMargin.left)
				.attr("y",function(d,i){
					return svgMapHeight-legendMargin.bottom-leLength+ (leSize +legendMargin.all) * i;
				})
				.attr("width",leSize-10)
				.attr("height",leSize)
				.attr("rx",5)
				.attr("ry",5)
				.attr("fill",function(d){
					
					return colorScheme[colorMap.get(d)];
				})
			
			legend.append("text")
				.attr("class","legend")
				.attr("x",legendMargin.left)
				.attr("y",svgMapHeight-legendMargin.bottom-leLength-10)
				.style("font-size",function(){
					return parseInt(d3.select(this).style("font-size"))+2;
				})
				.text("流域")
			
			
			
			legend.selectAll("text[class='.legendText']")
				.data(legendMap)
				.enter()
				.append("text")
				.attr("class","legendText")
				.attr("x",legendMargin.left)
				.attr("y",function(d,i){
					return svgMapHeight-legendMargin.bottom-leLength +(leSize+legendMargin.all) * i;
				})
				.style("fill",function(d,i){
					return colorScheme[colorMap.get(d)];
				})
				.attr("dx",leSize)
				.attr("dy","1em")
				.text(function(d){
					return d;
				})
				
			
			//所有数据点
			var timerSelected = null;
			gDataAll = gDataAll.data(locData)
				.enter()
			  .append("circle")
				.attr("r",5)
				.attr("fill",function(d){
					var index = colorMap.get(d.basin)
					if(index == undefined) index = colorMap.get("其他")
					return colorScheme[index];
				})
				.attr("transform",function(locData){
					var x = locData['lon'];
					var y = locData['lat'];
					return "translate("+projection([x,y])+")";
				})
				.attr("data-origin",function(locData){
					return projection([locData['lon'],locData['lat']])
				})
				.on("mouseover", function(d) {
					
					//悬停时间超过300毫秒，渲染折线图
					timerSelected = d3.timeout(function(){
						d3.select("#description")
							.html(
			    `<h2>详细信息</h2>
			    <p>
			              编号:${d.code}</br>
				站点名称:${d.name}</br>
				 流域:${d.basin} </br>
				断面属性:${d.section == "empty"?"暂无信息":d.section}</br>
				</P>
				托管方:${d.custodian == "empty"?"暂无信息":d.custodian} </br>
				状态:${d.status == "无"? "暂无信息":d.status} </br>
				设立时间:${d.setupdate == "无"? "暂无信息":d.setupdate} </br>
				<p> 
				经度:${d.lon} </br>
				 纬度:${d.lat} </br>
				</p>
				<h3>简介</h3>
				<p>${d.description}</p>`);
						drawLineMap(d.code,d.name);
					},300);
					
					d3.select(this).moveToFront()
					
					d3.select(this)
						.transition()
						.duration(500)
						.ease(d3.easeBounceOut)
						.attr("r",sizeSelected)
						.style("stroke-opacity",0.3)
						.style("fill",colorSelected)
						.style("fill-opacity",1)
				
						
						
			       	divTooltip.transition()
			       		.duration(300)
			       		.style("opacity",1)
			       	divTooltip.html(`站点名称:${d.name}</br>
				 流域:${d.basin} </br>
				断面属性:${d.section == "empty"?"暂无信息":d.section} </br>	
				 设立时间:${d.setupdate} </br>`) 	
			    })
			    .on("mouseout", function(d) {
			    	d3.select(this)
			    		.transition()
			    		.ease(d3.easeCubicIn)	
			    		.duration(500)
						.attr("r",sizeNormal)
			         	.style("stroke-opacity",1)
			         	.style("fill",function(d){
			         		var index = colorMap.get(d.basin)
			         		if(index == undefined) index = colorMap.get("其他")
							return colorScheme[index];
			         	})
			         	.style("fill-opacity",0.75)
						
						
			    	
			      	divTooltip.transition()
			      		.delay(1500)
			        	.duration(500)
			         	.style("opacity", 0)
					
					//未超过xxx毫秒，停止计时
			    	timerSelected.stop();
			    })
			  
				
		})
		//svg画布调用zoom
		svgCNMap.call(zoom)
			.transition()
			.duration(500)
			.call(zoom.scaleTo,1.5)
			//缩放按钮
		
		
	
		
		
		
		divCNMap.append("button")
			.attr("id","zoomIn")
			.attr("class","button")
			.text("+")
			.on("click",zoomIn)
			
		divCNMap.append("button")
			.attr("id","zoomOut")
			.attr("class","button")
			.text("-")
			.on("click",zoomOut)
		
		
		
		function zoomIn(){
			svgCNMap.transition()
				.duration(400)
				.call(zoom.scaleBy,1.5);
		}
		function zoomOut(){
			svgCNMap.transition()
				.duration(400)
				.call(zoom.scaleBy,1/1.5);
		}
		function zoomed(){
			//console.debug(d3.event.transform)
			gMap.attr("transform",function(){
					return d3.event.transform
				})

			gDataAll.attr("transform",function(){
					point = this.dataset.origin.split(",")
					
					point[0] = Number(point[0]);
					point[1] = Number(point[1]);
					
					return "translate("+d3.event.transform.apply(point)+") scale("+Math.pow(d3.event.transform.k,0.2)+")";
				})
			var scaleOpacity = d3.scaleLinear().domain([1,maxZoom/10]).range([0.3,1]);
			gNameAll.attr("transform",function(){
					point = this.dataset.origin.split(",")
					
					point[0] = Number(point[0]);
					point[1] = Number(point[1]);
					
					return "translate("+d3.event.transform.apply(point)+") scale("+Math.pow(d3.event.transform.k,0.2)+")";
				})
				.style("fill-opacity",scaleOpacity(d3.event.transform.k));		
				
		}
		
		
		
		
		d3.select("#div1")
		  .append("div")
			.attr("id","description")
			.style("height",svgMapHeight+"px")
			.html(`
			    <h2>详细信息</h2>
			    <p>
			              编号:</br>
				站点名称:</br>
				 流域:</br>
				断面属性:</br>
				</P>
				托管方: </br>
				状态:</br>
				设立时间:</br>
				<p> 
				经度:</br>
				 纬度:</br>
				</p>
				<h3>简介</h3>
				<p></p>`);
	/*=========================================中国地图svg======================================END*/
	
	/*=========================================折线图svg========================================START*/
	
		
		var margin = {top: 30, right: 20, bottom: 25, left: 30}
		var chartWidth = 1800 - margin.left - margin.right;
		var chartHeight = 250 - margin.top - margin.bottom;
		//div LineChart
		var div = d3.select("body")
	 	  .append("div")
			.attr("class","line-chart")
					
		var svgLineChart = div.append("svg")
			.attr("id","line-chart")
			.attr("width",chartWidth+margin.left+margin.right)
			.attr("height",chartHeight+margin.top+margin.bottom)
		
		//初始化scale
		var xScale = d3.scaleTime()
					.domain([new Date(2015,1,1), new Date(2015,2,10)])
					.range([0,chartWidth])
					
		//y轴scale
		var yScale = d3.scaleLinear()
					.domain([0,10])
					.range([chartHeight, 0])
				
		
		var gLine = svgLineChart.append("g")
			.attr("transform","translate("+margin.left+","+margin.top+")")
			.attr("id","Line-Chart")
		
		var gX = gLine.append("g")			
			.call(d3.axisBottom(xScale))
			.attr("transform","translate("+[0,chartHeight]+")")
				
		var gY = gLine.append("g")
			.call(d3.axisLeft(yScale))
		
		
		

		//线段路径生成器
		var lineDo = d3.line()
			.x(function(d) {  return xScale(d.sta_time); }) 
			.y(function(d) {  return yScale(d.sta_do_v); }) 
			.curve(d3.curveMonotoneX) 
		var linePh = d3.line()
			.x(function(d) {  return xScale(d.sta_time); }) 
			.y(function(d) {  return yScale(d.sta_ph_v); }) 
			.curve(d3.curveMonotoneX) 
		var lineAn = d3.line()
			.x(function(d) {  return xScale(d.sta_time); }) 
			.y(function(d) {  return yScale(d.sta_an_v); }) 
			.curve(d3.curveMonotoneX) 
		var linePp = d3.line()
			.x(function(d) {  return xScale(d.sta_time); }) 
			.y(function(d) {  return yScale(d.sta_pp_v); }) 
			.curve(d3.curveMonotoneX) 
		var lineToc = d3.line()
			.x(function(d) {  return xScale(d.sta_time); }) 
			.y(function(d) {  return yScale(d.sta_toc_v); }) 
			.curve(d3.curveMonotoneX) 
		
		
		//Ph Do Pp An Toc线段
		var pathDo = gLine.append("path")
			.attr("class","line")
		

		var pathPh = gLine.append("path")
			.attr("class","line")
			
			
		var pathAn = gLine.append("path")
			.attr("class","line")
		
			
		var pathPp = gLine.append("path")
			.attr("class","line")
			
			
		var pathToc = gLine.append("path")
			.attr("class","line")
			
		//线条颜色
		var lineColor = d3.schemeCategory10;
		
		var flag = false;
		
		var attrMap = d3.map().set("An",0)
			.set("Pp",1)
			.set("Ph",2)
			.set("Do",3)
		//	.set("Toc",4)
			
		//linechart legend标注
		var leLineChart = attrMap.keys();
		
		var gLeLine = svgLineChart.append("g")
			.attr("class","legend");
			
		gLeLine.append("g")
			.selectAll("rect")
			.data(leLineChart)
			.enter()
			.append("rect")
			.attr("transform",function(d,i,n){
				return "translate("+(chartWidth-margin.right-n.length*80+i*80)+",10)";
			})
			.attr("width",20)
			.attr("height",10)
			.style("fill",function(d){
				return lineColor[attrMap.get(d)]
			})
			.style("fill-opacity",0.6)
			.style("stroke",function(d){
				return lineColor[attrMap.get(d)]
			})
			.style("stroke-width",1)
			.style("rx",5)
			.style("ry",5)
			
		gLeLine.append("g")
			.selectAll("text")
			.data(leLineChart)
			.enter()
			.append("text")
			.attr("x",function(d,i,n){
				return chartWidth-margin.right-n.length*80+i*80;
			})
			.attr("y",10)
			.text(function(d){
				return d;
			})
			.attr("dy","0.6em")
			.style("fill",function(d){
				return lineColor[attrMap.get(d)];
			})
			.attr("dx",22)
			
		var locText = svgLineChart.append("text")
			.attr("transform","translate("+[chartWidth/3,margin.top/1.5]+")")
		
		function drawLineMap(selectedID, name){
			
			d3.csv("res/国控地表水201501站点监测数据.csv",function(d){
				if(d.sta_id == selectedID)
					return d;
			}).then(function(dataset){
				
				
//				dataset = d3.nest()
//					.key(function(d){return d.sta_id})
//					.entries(dataset)
//					

				//显示站点名称
				locText.text((name+"2015年1月国控地表水检测数据"))
				
				
				var lineInit = d3.line()
					.x(function(d,i) { return chartWidth/dataset.length*i;})
					.y(function(d) { return 0;})
					.curve(d3.curveMonotoneX) 
				
				if (!flag){
					flag = true;
				
					pathAn.datum(dataset)
						.attr("d",lineInit)
						.style("stroke",lineColor[attrMap.get("An")])
					pathPp.datum(dataset)
						.attr("d",lineInit)
						.style("stroke",lineColor[attrMap.get("Pp")])
					pathPh.datum(dataset)
						.attr("d",lineInit)
						.style("stroke",lineColor[attrMap.get("Ph")])
					pathDo.datum(dataset)
						.attr("d",lineInit)
						.style("stroke",lineColor[attrMap.get("Do")])
//					pathToc.datum(dataset)
//						.attr("d",lineInit)
//						.style("stroke",lineColor[attrMap.get("Toc")])
						
				}
				
				//对时间数据进行处理
				var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
				
				dataset.forEach(function(d){
				
					
					d.sta_time = parseTime(d.sta_time)
				
				})
				
				
				var minTime = d3.min(dataset,function(d){
					return d.sta_time;
				})
				var maxTime = d3.max(dataset,function(d){
					return d.sta_time;
				})
				
				var maxValue = d3.max(dataset,function(d){
					var max = Number(d.sta_do_v);
					if(d.sta_ph_v > max){
						max = Number(d.sta_ph_v);
					}
					if(d.sta_an_v > max){
						max = Number(d.sta_an_v);
					}
					if(d.sta_pp_v > max){
						max = Number(d.sta_pp_v);
					}
//					if(d.sta_toc_v > max){
//						max = Number(d.sta_toc_v);
//					}
					return max;
				})
				
				var minValue = d3.min(dataset,function(d){
					
					var min = Number(d.sta_do_v);
					if(d.sta_ph_v < min){
						min = Number(d.sta_ph_v);
					}
					if(d.sta_an_v < min){
						min = Number(d.sta_an_v);
					}
					if(d.sta_pp_v <	 min){
						min = Number(d.sta_pp_v);
					}
//					if(d.sta_toc_v < min){
//						min = Number(d.sta_toc_v);
//					}
					return min;
				})
				
		
			
				//x轴scale
				xScale = d3.scaleTime()
					.domain([minTime, maxTime])
					.range([0,chartWidth])
					
					
				//y轴scale
				yScale = d3.scaleLinear()
					.domain([minValue-1,maxValue+1])
					.range([chartHeight, 0])
				
				
				
				
				//动画变换
				var delay = 100;
				var duration = 700;
				
				gX.transition()
					.duration(duration)
					.call(d3.axisBottom(xScale))
				
				gY.transition()
					.duration(duration)
					.call(d3.axisLeft(yScale))
		
				
				
		
				
				pathAn.datum(dataset)
					.transition()
					.duration(duration)
					.delay(delay*0)
					.attrTween("d",function(d){
						var pre = this.getAttribute("d");
						var cur = lineAn(d);
					
						return d3.interpolatePath(pre,cur);
					})
			
				pathDo.datum(dataset)
					.transition()
					.duration(duration)
					.delay(delay*1)
					.attrTween("d",function(d){
						var pre = this.getAttribute("d");
						var cur = lineDo(d);
					
						return d3.interpolatePath(pre,cur);
					})
				
				pathPh.datum(dataset)
					.transition()
					.duration(duration)
					.delay(delay*2)
					.attrTween("d",function(d){
						var pre = this.getAttribute("d");
						var cur = linePh(d);
					
						return d3.interpolatePath(pre,cur);
					})
				
				pathPp.datum(dataset)
					.transition()
					.duration(duration)
					.delay(delay*3)
					.attrTween("d",function(d){
						var pre = this.getAttribute("d");
						var cur = linePp(d);
					
						return d3.interpolatePath(pre,cur);
					})
	
		
				
			})
		}
		
		/*=========================================折线图svg========================================END*/
		
	})
