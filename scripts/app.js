drawing = 0;

mouseOverRect = function(x,t,currentObject,lineId,blockId,data){
  barWidth = graphInfo[regime].barWidth;
  d3.select('.graphContainer #'+lineId+' #'+blockId+' .hoverRectangle')
    .attr('opacity',0.3)
    .attr('x',x)
    .attr('width', function() {
      return getRectWidth(t, data);
    });
  graphId = currentObject+'---'+lineId+'---'+blockId;
  updateLeftColumn('graphHover',t,graphId,x);
  if (currentObject) {
    var g = {};
    g.name = 'good';
    goodColor = getRectFill(currentObject, g, t);
    g.name = 'bad';
    badColor = getRectFill(currentObject, g, t);
    d3.select('.productionGraph #good').attr('fill', goodColor);
    d3.select('.productionGraph #bad').attr('fill', badColor);
    $('.legend-good').css({'background-color': goodColor});
    $('.legend-bad').css({'background-color': badColor});
  }
}

getPeriodData = function(text, data) {
  regime === 'm1' ? period = 1 : period = 8;

  graphData = {};
  graphData.machine = $('.maintable .pressed').attr('machine');
  graphData.sector = $('.maintable .pressed').attr('sector');

  productionPerHour = 0;
  machinesCount = 1;

  if (graphData.machine === '-' && graphData.sector === '-') {
    productionPerHour = facilityInfo.production;
    machinesCount = facilityInfo.machines;
  } else if (graphData.machine !== '-') {
    productionPerHour = machineInfo[graphData.machine].production;
  } else {
    productionPerHour = sectorsInfo[graphData.sector].production;
    machinesCount = sectorsInfo[graphData.sector].machines;
  }

  leftBlockData = {
    dateSelectorText: text,
    currentTime: "",
    planProduction: 0,
    badProduction: 0,
    goodProduction: 0,
    factProduction: 0,
    planTime: 0,
    factTime: 0,
    stopTime: 0,
    availabilityPercent: 0,
    productionPercent: 0,
    qualityPercent: 0,
    oeePercent: 0,
    stopHoursC1: 0,
    stopHoursC2: 0,
    stopHoursC3: 0,
    stopHoursC4: 0,
    stopHoursC5: 0
  }

  leftBlockData.planProduction = Math.round(productionPerHour*period) * data.length;
  leftBlockData.planProduction += ""; leftBlockData.planProduction = leftBlockData.planProduction.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " т";

  data.forEach(function(d) {
    leftBlockData.factProduction += Math.round(((+d.production)/100)*((+d.availability)/100)*productionPerHour*period);
  });
  leftBlockData.factProduction += ""; leftBlockData.factProduction = leftBlockData.factProduction.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " т";

  data.forEach(function(d) {
    fact = Math.round(((+d.production)/100)*((+d.availability)/100)*productionPerHour*period);
    leftBlockData.goodProduction += Math.round(fact*((+d.quality)/100));
    leftBlockData.badProduction += Math.round(fact*((100-(+d.quality))/100));
  });

  leftBlockData.goodProduction += ""; leftBlockData.goodProduction = leftBlockData.goodProduction.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " т";
  leftBlockData.badProduction += ""; leftBlockData.badProduction = leftBlockData.badProduction.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " т";

  leftBlockData.planTime = Math.round(period*machinesCount)*data.length;

  data.forEach(function(d) {
    plan = Math.round(period*machinesCount);
    leftBlockData.factTime += Math.round(plan * (+d.availability)/100);
  });

  leftBlockData.stopTime = Math.round(leftBlockData.planTime - leftBlockData.factTime);

  leftBlockData.planTime += ""; leftBlockData.planTime = leftBlockData.planTime.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " ч";
  leftBlockData.factTime += ""; leftBlockData.factTime = leftBlockData.factTime.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " ч";
  leftBlockData.stopTime += ""; leftBlockData.stopTime = leftBlockData.stopTime.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " ч";

  data.forEach(function(d) {
    leftBlockData.availabilityPercent += (+d.availability);
    leftBlockData.productionPercent += (+d.production);
    leftBlockData.qualityPercent += (+d.quality);
    leftBlockData.oeePercent += Math.round(((+d.availability)/100)*((+d.production)/100)*((+d.quality)/100)*100);
  });

  leftBlockData.availabilityPercent = (leftBlockData.availabilityPercent/data.length).toFixed(0) + "%";
  leftBlockData.productionPercent = (leftBlockData.productionPercent/data.length).toFixed(0) + "%";
  leftBlockData.qualityPercent = (leftBlockData.qualityPercent/data.length).toFixed(0) + "%";
  leftBlockData.oeePercent = (leftBlockData.oeePercent/data.length).toFixed(0) + "%";

  data.forEach(function(d) {
    leftBlockData.stopHoursC1 += +d.c1;
    leftBlockData.stopHoursC2 += +d.c2;
    leftBlockData.stopHoursC3 += +d.c3;
    leftBlockData.stopHoursC4 += +d.c4;
    leftBlockData.stopHoursC5 += +d.c5;
  });

  return leftBlockData;
}

mouseOverPeriod = function(text, data) {
  periodData = getPeriodData(text, data);
  writeLeftColumnData(periodData);
  stopsGraph.update(periodData);
  productionGraph.update(periodData);
}

mouseLeaveBlock = function(){
  if(regime=='m1'){
    $('.dateSelector .text').html("в июле 2015 г.");
  } else if(regime=='m12'){
    $('.dateSelector .text').html("в 2015 г.");
  }
  updateLeftColumn('tableClick',"","","");
  d3.selectAll('.hoverRectangle').attr('opacity',0)
  d3.select('.productionGraph #good').attr('fill', '#fd6');
  d3.select('.productionGraph #bad').attr('fill', '#ccb152');
  $('.legend-good').css({'background-color': '#fd6'});
  $('.legend-bad').css({'background-color': '#ccb152'});
}

getRectId = function(t){
  return currentObject+"---"+lineId+"---"+blockId+"---"+t.start;
}

getRectX = function(t,blockId,data){
  if (!+t.availability) {
    start = _.findIndex(data, {'start': t.start});

    for(i = start; i > -1; i--) {
      if (+data[i].availability) {
        t = data[i+1];
        break;
      }
      if (!i) {
        t = data[i];
        break;
      }
    }
  }

  barWidth = graphInfo[regime].barWidth;
  if(regime=='m1'){
    x = ((35039 - +t.start)%24)*barWidth;
  } else {
    date = getDate(35039 - (+t.start),"");
    day = date.day;
    hour = date.hour;
    x = day*3*barWidth + parseInt(hour/8)*barWidth;
  }

  return x;
}

getRectY = function(g,t){
  if(g.name=='hover') return 0;

  heightPercentGood = (+t.availability)*(+t.production)*(+t.quality);
  heightGood = Math.round(heightPercentGood*blockHeight/1000000);
  heightPercentBad = (+t.availability)*(+t.production)*(100-(+t.quality));
  heightBad = Math.round(heightPercentBad*blockHeight/1000000);

  if(g.name=='good') return blockHeight - heightGood;
  if(g.name=='bad') return blockHeight - heightGood - heightBad;
  if(g.name=='whiteStroke') return blockHeight - heightGood - 1;
}

getRectHeight = function(g,t){
  if(g.name=='hover') return blockHeight;
  if(g.name=='good') {
    if(+t.availability!=0){
      return Math.round(blockHeight*(+t.availability)*(+t.production)*(+t.quality)/1000000);
    } else {
      return 3;
    }
  }
  if(g.name=='bad') return Math.round(blockHeight*(+t.availability)*(+t.production)*(100-(+t.quality))/1000000);
  if(g.name=='whiteStroke') return 1;
}

getRectWidth = function(t, data) {
  var width = graphInfo[regime].barWidth;

  if (!+t.availability) {
    var current = _.findIndex(data, {'start': t.start});
    var i;
    var left = 0;
    var right = 0;

    for(i = current; i > -1; i--) {
      if (!+data[i].availability) {
        left+=1;
      } else {
        break;
      }
    }

    for(i = current; i < data.length; i++) {
      if (!+data[i].availability) {
        right+=1;
      } else {
        break;
      }
    }

    width = (left + right - 1) * width;
  }

  return width;
}

getRectFill = function(currentObject,g,t){
  if(g.name=='hover' || g.name=='whiteStroke') return '#fff';

  //определяем цвет бригады
  minPeriod = graphInfo[regime].minPeriod;
  brigadeSerialNumber = parseInt((+t.start)/(8/minPeriod))%brigades.schedule.length;
  brigade = brigades.schedule[brigadeSerialNumber];
  //console.log('brigade',brigade,(+t.start),parseInt((+t.start)/8),parseInt((+t.start)/8)%brigades.schedule.length)
  if(g.name=='good' || g.name=='bad') brigadeColor = brigades.colors[g.name][brigade-1]
    else brigadeColor=g.color;

  //если выбрано не производство, красим в цвета бригад
  if(currentObject!=""){
    if(+t.availability!=0){
      return brigadeColor;
    } else {
      //если сейчас простой, красим цветом простоя
      if((+t.c1)!=0){
        return stopsInfo[0].color;
      } else if ((+t.c2)!=0) {
        return stopsInfo[1].color;
      } else if ((+t.c3)!=0) {
        return stopsInfo[2].color;
      } else if ((+t.c4)!=0) {
        return stopsInfo[3].color;
      } else if ((+t.c5)!=0) {
        return stopsInfo[4].color;
      }
    }
  }

  return g.color;
}

getStopX = function(t,blockId,data){
  barWidth = graphInfo[regime].barWidth;
  if(regime=='m1'){
    x = ((35039 - +t.start)%24)*barWidth;
  } else {
    date = getDate(35039 - (+t.start),"");
    day = date.day;
    hour = date.hour;
    x = day*3*barWidth + parseInt(hour/8)*barWidth;
  }

  return x;
}

function getStopY(s, t) {
  var shift = 41;
  var y;

  if (s.name === 'c3') {
    y = shift;
  } else if (s.name === "c1") {
    y = shift + graphInfo[regime].stopHeight * t.c3;
  } else if (s.name === "c2") {
    y = shift + graphInfo[regime].stopHeight * t.c3 + graphInfo[regime].stopHeight * t.c1;
  } else if (s.name === "c4") {
    y = shift + graphInfo[regime].stopHeight * t.c3 + graphInfo[regime].stopHeight * t.c1 + graphInfo[regime].stopHeight * t.c2;
  } else {
    y = shift + graphInfo[regime].stopHeight * t.c3 + graphInfo[regime].stopHeight * t.c1 + graphInfo[regime].stopHeight * t.c2 + graphInfo[regime].stopHeight * t.c4;
  }

  return y;
}

function getStopHeight(s, t) {
  return t[s.name] * graphInfo[regime].stopHeight;
}

function updateGraphBlock(currentObject, lineId, blockId, data){
  groups = [
    { name: 'hover',
      color: '#fff',
      opacity: 1
    },
    { name: 'good',
      color: '#fd6',
      opacity: 1
    },
    { name: 'bad',
      color: '#ccb152',
      opacity: 1
    },
    { name: 'whiteStroke',
      color: '#fff',
      opacity: 0.5
    }
  ];

  period = graphInfo[regime].period;
  barWidth = graphInfo[regime].barWidth;

  graph = d3.select('.graphContainer #'+lineId+' #'+blockId);
  blockName = graph.select('.block-name');

  blockName.on('mouseover', function() {
    text = d3.select(this).text();
    if (regime === 'm1') {
      text = text + ' июля 2015 г.'
    }
    mouseOverPeriod(text, data);
  });

  groups.forEach(function(g){
    graph
      .select('svg .'+g.name)
      .selectAll('rect')
      .attr('y',0)
      .attr('height',0);
  });

  groups.forEach(function(g){
    graph
      .select('svg .'+g.name)
      .selectAll('rect')
      .data(data)
      .attr('id',function(t){
        return getRectId(t)
      })
      .attr('x', function(t){
        return getRectX(t,blockId,data)
      })
      .attr('y', function(t){
        return getRectY(g,t)
      })
      .attr('height', function(t){
        return getRectHeight(g,t)
      })
      .attr('width', function(t) {
        return getRectWidth(t, data);
      })
      .attr('fill', function(t){
        return getRectFill(currentObject,g,t)
      })
      .attr('opacity',g.opacity)
      .on('mouseover',function(t){
        x = d3.select(this).attr('x');
        mouseOverRect(x,t,currentObject,lineId,blockId,data);
      });
  })

  stops = [
    { name: 'c3', fill: '#b44' },
    { name: 'c1', fill: '#273' },
    { name: 'c2', fill: '#744' },
    { name: 'c4', fill: '#46b' },
    { name: 'c5', fill: '#39b' }
  ];

  var isMachineSelected = $('.maintable .pressed').attr('machine') !== '-';

  stops.forEach(function(s){
    graph
      .select('svg .' + s.name)
      .selectAll('rect')
      .attr('y',0)
      .attr('height',0);
  })

  stops.forEach(function(s){
    graph
      .select('svg .' + s.name)
      .selectAll('rect')
      .data(data)
      .attr('id',function(t){
        return getRectId(t)
      })
      .attr('x', function(t){
        return getStopX(t,blockId,data)
      })
      .attr('y', function(t){
        return getStopY(s,t)
      })
      .attr('height', function(t){
        return getStopHeight(s,t)
      })
      .attr('width', graphInfo[regime].barWidth)
      .attr('fill', s.fill)
      .attr('opacity', isMachineSelected ? 0 : 1);
  })
}

function drawGraphBlock(currentObject, lineId, blockId, data){
  blockWidth = $('.graphContainer #'+lineId+' #'+blockId).css('width');
  blockWidth = removePostfix(blockWidth,'px');
  blockHeight = 40;

  groups = [
    { name: 'hover',
      color: '#fff',
      opacity: 1
    },
    { name: 'good',
      color: '#fd6',
      opacity: 1
    },
    { name: 'bad',
      color: '#ccb152',
      opacity: 1
    },
    { name: 'whiteStroke',
      color: '#fff',
      opacity: 0.5 //0.3
    }
  ];

  period = graphInfo[regime].period;
  if(regime=='m12'){
    monthNumber = +blockId.substr(5,1000);
    period = calendar.months[monthNumber].days * 24;
  }
  barWidth = graphInfo[regime].barWidth;
  graph = d3.select('.graphContainer #'+lineId+' #'+blockId);
  blockName = graph.select('.block-name');

  blockName
  .on('mouseover', function() {
    text = d3.select(this).text();
    if (regime === 'm1') {
      text = text + ' июля 2015 г.'
    }
    mouseOverPeriod(text, data);
  })
  .on('mouseleave', mouseLeaveBlock);

  graph
    .append('svg')
    .attr('width',blockWidth)
    .attr('height',75)
    .on('mouseleave', mouseLeaveBlock);

  groups.forEach(function(g){
    graph
      .select('svg')
      .append('g')
      .attr('class',g.name);

    graph
      .select('svg .'+g.name)
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('id',function(t){
        return getRectId(t)
      })
      .attr('x', function(t){
        return getRectX(t,blockId,data)
      })
      .attr('y', function(t){
        return getRectY(g,t)
      })
      .attr('height', function(t){
        return getRectHeight(g,t)
      })
      .attr('width', function(t) {
        return getRectWidth(t, data);
      })
      .attr('fill', function(t){
        return getRectFill(currentObject,g,t)
      })
      .attr('opacity',g.opacity)
      .on('mouseover',function(t){
        x = d3.select(this).attr('x');
        mouseOverRect(x,t,currentObject,lineId,blockId,data);
      });
  })

  stops = [
    { name: 'c3', fill: '#b44' },
    { name: 'c1', fill: '#273' },
    { name: 'c2', fill: '#744' },
    { name: 'c4', fill: '#46b' },
    { name: 'c5', fill: '#39b' }
  ];

  var isMachineSelected = $('.maintable .pressed').attr('machine') !== '-';

  stops.forEach(function(s){
    graph
      .select('svg')
      .append('g')
      .attr('class', s.name);

    graph
      .select('svg .' + s.name)
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('id',function(t){
        return getRectId(t)
      })
      .attr('x', function(t){
        return getStopX(t,blockId,data)
      })
      .attr('y', function(t){
        return getStopY(s,t)
      })
      .attr('height', function(t){
        return getStopHeight(s,t)
      })
      .attr('width', graphInfo[regime].barWidth)
      .attr('fill', s.fill)
      .attr('opacity', isMachineSelected ? 0 : 1);
  })

  if(regime=='m12'){
    period /= 8;
  }

  //полоска максимума
  graph
    .select('svg')
    .append('rect')
    .attr('x',0)
    .attr('y',0)
    .attr('width',period*barWidth)
    .attr('height',1)
    .attr('fill','#000')
    .attr('opacity',0.2)

  //полоска наведения
  graph
    .select('svg')
    .append('rect')
    .attr('class','hoverRectangle')
    .attr('x',0)
    .attr('y',1)
    .attr('width',0)
    .attr('height',39)
    .attr('fill','#d32')
    .attr('opacity',0);
}

function updateGraphBlocks(objectType, objectName){
  //console.log("updating graph blocks", objectType, objectName)

  d3.selectAll('.graphContainer .good rect')
    .attr('height',0);
  d3.selectAll('.graphContainer .bad rect')
    .attr('height',0);
  d3.selectAll('.graphContainer .whiteStroke rect')
    .attr('height',0);

  appData[objectType][regime].forEach(function(objectList){
    currentObject = objectList.key;
    linesData = objectList.values;

    if(currentObject==objectName){
      linesData.forEach(function(lineData,i){
        lineId = lineData.key;
        blocksData = lineData.values;

        if (regime === 'm1') {
          var start = +blocksData[0].key.split('-')[0].substring(3) + 1;
          var finish = +blocksData[blocksData.length - 1].key.split('-')[0].substring(3) + 1;
          var text = start + '−' + finish + ' июля 2015 г.';
          var data = [];
          blocksData.forEach(function(bD) {
            data = data.concat(bD.values);
          });

          d3.select('.graphContainer #' + lineId + ' .week-number')
          .on('mouseover', function() {
            mouseOverPeriod(text, data);
          })
          .on('mouseleave', mouseLeaveBlock);
        }

        blocksData.forEach(function(blockData){
          blockId = blockData.key;
          rectData = blockData.values;

          updateGraphBlock(currentObject, lineId, blockId,rectData);
        })
      })
    }
  })
}

function createGraphBlocks(objectType, objectName){
  //console.log("creating graph blocks", objectType, objectName)

  getBlockId = function(a,b){
    if(regimeCode) return "month"+a;
    else return "day"+a+"-weekday"+b;
  }

  getBlockWidth = function(){
    if(regimeCode) return 31*3*graphInfo[regime].barWidth;
    else return 24*graphInfo[regime].barWidth;
  }

  appData[objectType][regime].forEach(function(objectList){
    currentObject = objectList.key;
    linesData = objectList.values;

    //console.log('searching for object', currentObject, objectName)
    if(currentObject==objectName){
      //Очищаем всё, что было в графике
      $('.graphContainer').html("");
      //console.log('object found. starting to create blocks');

      //создаем ряды для графика
      linesData.forEach(function(lineData,i){
        lineId = lineData.key;
        blocksData = lineData.values;
        lineBlocksList = graphLinesSettings[regime][i];
        lineWidth = lineBlocksList.length*( getBlockWidth()+10 );

        //console.log('creating blocks',lineBlocksList)

        $('.graphContainer').append("<div class='graphLine "+graphLinesSettings.shift[i]+"' id='"+lineId+"'>");
        line = $('.graphContainer #'+lineId);
        line.css('width',lineWidth);

        if (regime === 'm1') {
          var start = +blocksData[0].key.split('-')[0].substring(3) + 1;
          var finish = +blocksData[blocksData.length - 1].key.split('-')[0].substring(3) + 1;
          var text = start + '−' + finish + ' июля 2015 г.';
          var data = [];
          blocksData.forEach(function(bD) {
            data = data.concat(bD.values);
          });

          d3.select('.graphContainer #'+lineId)
          .append('span')
          .classed('week-number', true)
          .style('top', (i*75) + 25 + 'px')
          .html(i + 27)
          .on('mouseover', function() {
            mouseOverPeriod(text, data);
          })
          .on('mouseleave', mouseLeaveBlock);
        }

        if(graphLinesSettings.shift[i]!="") $('.graphContainer').append("<div class='clear'></div>")

        lineBlocksList.forEach(function(d){
          line.append("<div class='leftBlock graphBlock' id='"+getBlockId(d[0],d[1])+"'></div>");
          block = $('.graphContainer #'+lineId+' #'+getBlockId(d[0],d[1]));
          block.css('width',getBlockWidth());
        })

        blocksData.forEach(function(blockData){
          blockId = blockData.key;
          rectData = blockData.values;

          if(regime=='m1') blockName = (+blockId.substr(3,blockId.indexOf('-')-3))+1;
          if(regime=='m12') {
            monthNumber = +blockId.substr(5,1000);
            blockName = calendar.months[monthNumber].name;
            if(monthNumber==7) {blockName += " 2014";}
            if(monthNumber==0) {blockName += " 2015";}
          }

          $('.graphContainer #'+lineId+' #'+blockId).append('<span class="block-name">'+blockName+'</span>');

          drawGraphBlock(currentObject, lineId, blockId,rectData);
        })

      })
    }
  })
  updateLeftColumn('tableClick',"","","");
}

appSettings = {
  regimes: ['m1','m12'],
  switcherPictures: ['../images/switcher-month.png','../images/switcher-year.png'],
  dateSelectorText: ['в июле 2015 г.','в 2015 г.']
}

graphLinesSettings = {
  m1: [
        [[0,2],[1,3],[2,4],[3,5],[4,6]],
        [[5,0],[6,1],[7,2],[8,3],[9,4],[10,5],[11,6]],
        [[12,0],[13,1],[14,2],[15,3],[16,4],[17,5],[18,6]],
        [[19,0],[20,1],[21,2],[22,3],[23,4],[24,5],[25,6]],
        [[26,0],[27,1],[28,2],[29,3],[30,4]]
      ],
  m12: [
         [[7,0]],
         [[8,0],[9,0],[10,0]],
         [[11,0],[0,0],[1,0]],
         [[2,0],[3,0],[4,0]],
         [[5,0],[6,0]]
       ],
  shift: ["rightBlock","","","",""],
}

graphInfo = {
  m1: {
    width: 72,
    period: 24,
    barWidth: 3,
    minPeriod: 1,
    stopHeight: 1
  },
  m12: {
    width: 180,
    period: 31*24,
    barWidth: 2,
    minPeriod: 8,
    stopHeight: 0.2
  },
  m48: {
    width: 36,
    period: 720,
    barWidth: 1,
    minPeriod: 24
  }
}

calendar = {
  startDate: {
  	year: 2011,
  	month: 7,   //счет от нуля
  	day: 1,     //счет от нуля
  	weekday: 1  //счет от нуля
  },
  months: [
    {
      name: "Январь",
      days: 31,
      nameRoditelniyPadezh: "янв"
    },
    {
      name: "Февраль",
      days: 28,
      nameRoditelniyPadezh: "фев"
    },
    {
      name: "Март",
      days: 31,
      nameRoditelniyPadezh: "мар"
    },
    {
      name: "Апрель",
      days: 30,
      nameRoditelniyPadezh: "апр"
    },
    {
      name: "Май",
      days: 31,
      nameRoditelniyPadezh: "мая"
    },
    {
      name: "Июнь",
      days: 30,
      nameRoditelniyPadezh: "июня"
    },
    {
      name: "Июль",
      days: 31,
      nameRoditelniyPadezh: "июля"
    },
    {
      name: "Август",
      days: 31,
      nameRoditelniyPadezh: "авг"
    },
    {
      name: "Сентябрь",
      days: 30,
      nameRoditelniyPadezh: "сен"
    },
    {
      name: "Октябрь",
      days: 31,
      nameRoditelniyPadezh: "окт"
    },
    {
      name: "Ноябрь",
      days: 30,
      nameRoditelniyPadezh: "ноя"
    },
    {
      name: "Декабрь",
      days: 31,
      nameRoditelniyPadezh: "дек"
    }
  ],
  seasons: ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"]
}

facilityInfo = {
  machines: 37,
  production: 84.2,
  margin: (200*8+1200*8+1900*5+2500*5+2900*5+3600*6)/37,
  price: (15000*8+18000*8+20000*5+38000*5+45000*5+56000*6)/37
}

sectorsInfo = {
  el: {
  	name: "Элеватор",
  	production: 19.2,
  	margin: 200,
  	price: 15000,
  	machines: 8
  },
  rv: {
  	name: "Рушально-веечный цех",
  	production: 19.2,
  	margin: 1200,
  	price: 18000,
  	machines: 8
  },
  vz: {
  	name: "Вальцевой",
  	production: 15.4,
  	margin: 1900,
  	price: 20000,
  	machines: 5
  },
  pr: {
  	name: "Прессовой",
  	production: 9.2,
  	margin: 2500,
  	price: 38000,
  	machines: 5
  },
  ex: {
  	name: "Экстракционный",
  	production: 6.2,
  	margin: 2900,
  	price: 45000,
  	machines: 5
  },
  cl: {
  	name: "Цех очистки",
  	production: 15,
  	margin: 3600,
  	price: 56000,
  	machines: 6
  }
}

machineInfo = {
  'el-br1': {
    name: ["1","бригада"],
    fullName: '1 бригада элеватора',
    production: 19.2,
    margin: 200,
    price: 15000
  },
  'el-br2': {
    name: ["2","бригада"],
    fullName: '2 бригада элеватора',
    production: 19.2,
    margin: 200,
    price: 15000
  },
  'el-br3': {
    name: ["3","бригада"],
    fullName: '3 бригада элеватора',
    production: 19.2,
    margin: 200,
    price: 15000
  },
  'el-br4': {
    name: ["4","бригада"],
    fullName: '4 бригада элеватора',
    production: 19.2,
    margin: 200,
    price: 15000
  },
  el10: {
  	name: ["1","конвейер-нории"],
  	production: 4.8,
  	margin: 200,
  	price: 15000
  },
  el11: {
  	name: ["2","конвейер-нории"],
  	production: 4.8,
  	margin: 200,
  	price: 15000
  },
  el12: {
  	name: ["3","конвейер-нории"],
  	production: 4.8,
  	margin: 200,
  	price: 15000
  },
  el13: {
  	name: ["4","конвейер-нории"],
  	production: 4.8,
  	margin: 200,
  	price: 15000
  },
  el20: {
  	name: ["1","распределительный конвейер"],
  	production: 9.6,
  	margin: 200,
  	price: 15000
  },
  el21: {
  	name: ["2","распределительный конвейер"],
  	production: 9.6,
  	margin: 200,
  	price: 15000
  },
  el30: {
  	name: ["1","конвейер для передачи семян"],
  	production: 9.6,
  	margin: 200,
  	price: 15000
  },
  el31: {
  	name: ["2","конвейер для передачи семян"],
  	production: 9.6,
  	margin: 200,
  	price: 15000
  },
  'rv-br1': {
    name: ["1","бригада"],
    fullName: '1 бригада рушально-веечного цеха',
    production: 19.2,
    margin: 1200,
    price: 18000
  },
  'rv-br2': {
    name: ["2","бригада"],
    fullName: '2 бригада рушально-веечного цеха',
    production: 19.2,
    margin: 1200,
    price: 18000
  },
  'rv-br3': {
    name: ["3","бригада"],
    fullName: '3 бригада рушально-веечного цеха',
    production: 19.2,
    margin: 1200,
    price: 18000
  },
  'rv-br4': {
    name: ["4","бригада"],
    fullName: '4 бригада рушально-веечного цеха',
    production: 19.2,
    margin: 1200,
    price: 18000
  },
  rv40: {
  	name: ["1","cеменорушка С-600"],
  	production: 4.8,
  	margin: 1200,
  	price: 18000
  },
  rv41: {
  	name: ["2","cеменорушка С-600"],
  	production: 4.8,
  	margin: 1200,
  	price: 18000
  },
  rv42: {
  	name: ["3","cеменорушка С-600"],
  	production: 4.8,
  	margin: 1200,
  	price: 18000
  },
  rv43: {
  	name: ["4","cеменорушка С-600"],
  	production: 4.8,
  	margin: 1200,
  	price: 18000
  },
  rv50: {
  	name: ["1","семеновейка Р1-МСТ"],
  	production: 9.6,
  	margin: 1200,
  	price: 18000
  },
  rv51: {
  	name: ["2","семеновейка Р1-МСТ"],
  	production: 9.6,
  	margin: 1200,
  	price: 18000
  },
  rv60: {
  	name: ["1","сепаратор СМР-11"],
  	production: 9.6,
  	margin: 1200,
  	price: 18000
  },
  rv61: {
  	name: ["2","сепаратор СМР-11"],
  	production: 9.6,
  	margin: 1200,
  	price: 18000
  },
  'vz-br1': {
    name: ["1","бригада"],
    fullName: '1 бригада вальцевого цеха',
    production: 15.4,
    margin: 1900,
    price: 20000
  },
  'vz-br2': {
    name: ["2","бригада"],
    fullName: '2 бригада вальцевого цеха',
    production: 15.4,
    margin: 1900,
    price: 20000
  },
  'vz-br3': {
    name: ["3","бригада"],
    fullName: '3 бригада вальцевого цеха',
    production: 15.4,
    margin: 1900,
    price: 20000
  },
  'vz-br4': {
    name: ["4","бригада"],
    fullName: '4 бригада вальцевого цеха',
    production: 15.4,
    margin: 1900,
    price: 20000
  },
  vz70: {
  	name: ["1","однопарные вальцы"],
  	production: 7.7,
  	margin: 1900,
  	price: 20000
  },
  vz71: {
  	name: ["2","однопарные вальцы"],
  	production: 7.7,
  	margin: 1900,
  	price: 20000
  },
  vz80: {
  	name: ["1","пятивалковые вальцы"],
  	production: 5.2,
  	margin: 1900,
  	price: 20000
  },
  vz81: {
  	name: ["2","пятивалковые вальцы"],
  	production: 5.2,
  	margin: 1900,
  	price: 20000
  },
  vz82: {
  	name: ["3","пятивалковые вальцы"],
  	production: 5.2,
  	margin: 1900,
  	price: 20000
  },
  'pr-br1': {
    name: ["1","бригада"],
    fullName: '1 бригада прессового цеха',
    production: 9.2,
    margin: 2500,
    price: 38000
  },
  'pr-br2': {
    name: ["2","бригада"],
    fullName: '2 бригада прессового цеха',
    production: 9.2,
    margin: 2500,
    price: 38000
  },
  'pr-br3': {
    name: ["3","бригада"],
    fullName: '3 бригада прессового цеха',
    production: 9.2,
    margin: 2500,
    price: 38000
  },
  'pr-br4': {
    name: ["4","бригада"],
    fullName: '4 бригада прессового цеха',
    production: 9.2,
    margin: 2500,
    price: 38000
  },
  pr90: {
  	name: ["1","жаровня АЖ-4М"],
  	production: 4.6,
  	margin: 2500,
  	price: 38000
  },
  pr91: {
  	name: ["2","жаровня АЖ-4М"],
  	production: 4.6,
  	margin: 2500,
  	price: 38000
  },
  pr100: {
  	name: ["1","пресс ПМ-450"],
  	production: 3.1,
  	margin: 2500,
  	price: 38000
  },
  pr101: {
  	name: ["2","пресс ПМ-450"],
  	production: 3.1,
  	margin: 2500,
  	price: 38000
  },
  pr102: {
  	name: ["3","пресс ПМ-450"],
  	production: 3.1,
  	margin: 2500,
  	price: 38000
  },
  'ex-br1': {
    name: ["1","бригада"],
    fullName: '1 бригада экстракционного цеха',
    production: 6.2,
    margin: 2900,
    price: 45000
  },
  'ex-br2': {
    name: ["2","бригада"],
    fullName: '2 бригада экстракционного цеха',
    production: 6.2,
    margin: 2900,
    price: 45000
  },
  'ex-br3': {
    name: ["3","бригада"],
    fullName: '3 бригада экстракционного цеха',
    production: 6.2,
    margin: 2900,
    price: 45000
  },
  'ex-br4': {
    name: ["4","бригада"],
    fullName: '4 бригада экстракционного цеха',
    production: 6.2,
    margin: 2900,
    price: 45000
  },
  ex110: {
  	name: ["1","экстрактор НД-1250"],
  	production: 2.1,
  	margin: 2900,
  	price: 45000
  },
  ex111: {
  	name: ["2","экстрактор НД-1250"],
  	production: 2.1,
  	margin: 2900,
  	price: 45000
  },
  ex112: {
  	name: ["3","экстрактор НД-1250"],
  	production: 2.1,
  	margin: 2900,
  	price: 45000
  },
  ex120: {
  	name: ["1","экстрактор МЭЗ-350"],
  	production: 3.1,
  	margin: 2900,
  	price: 45000
  },
  ex121: {
  	name: ["2","экстрактор МЭЗ-350"],
  	production: 3.1,
  	margin: 2900,
  	price: 45000
  },
  'cl-br1': {
    name: ["1","бригада"],
    fullName: '1 бригада цеха очистки',
    production: 15,
    margin: 3600,
    price: 56000
  },
  'cl-br2': {
    name: ["2","бригада"],
    fullName: '2 бригада цеха очистки',
    production: 15,
    margin: 3600,
    price: 56000
  },
  'cl-br3': {
    name: ["3","бригада"],
    fullName: '3 бригада цеха очистки',
    production: 15,
    margin: 3600,
    price: 56000
  },
  'cl-br4': {
    name: ["4","бригада"],
    fullName: '4 бригада цеха очистки',
    production: 15,
    margin: 3600,
    price: 56000
  },
  cl130: {
  	name: ["","Сепаратор А1-МСЛ"],
  	production: 15,
  	margin: 3600,
  	price: 56000
  },
  cl140: {
  	name: ["","Фильтр М8-КФМ"],
  	production: 15,
  	margin: 3600,
  	price: 56000
  },
  cl150: {
  	name: ["","ФС-2-70"],
  	production: 15,
  	margin: 3600,
  	price: 56000
  },
  cl160: {
  	name: ["","РФ-6"],
  	production: 15,
  	margin: 3600,
  	price: 56000
  },
  cl170: {
  	name: ["","ФЦ-М"],
  	production: 15,
  	margin: 3600,
  	price: 56000
  },
  cl180: {
  	name: ["","Линия раф. и дезод. L-10TD"],
  	production: 15,
  	margin: 3600,
  	price: 56000
  }
}

stopsInfo = [
  {
    name: "обслуживание",
    color: "#273"
  },
  {
    name: "переход на другой продукт",
    color: "#744"
  },
  {
    name: "аварийный ремонт",
    color: "#b44"
  },
  {
    name: "ожидание расходных материалов",
    color: "#46b"
  },
  {
    name: "ожидание заказа",
    color: "#39b"
  }
]

brigades = {
  schedule: [1,2,4,3,2,4,3,1,4,3,1,2,3,1,2,4,1,2,4,3,2,4,3,1,4,3,1,2,3,1,2,4,1,2,4,3,2,4,3,1,4,3,1,2,3,1,2,4],
  colors: {
    good: ["#fd6","#fb2","#fc4","#fa2"],
    bad: ["#ccb152","#cc961b","#cc961b","#cc881b"]
  }
}

//по часу определяет день, месяц, год, номер недели, номер дня недели
function getDate(hours,option){
  date = {};

  daysPassed = parseInt(hours/24);                            //сколько прошло дней

  date.year = calendar.startDate.year;                        //начальные значения. вычисляются в цикле
  date.month = calendar.startDate.month;
  date.day = calendar.startDate.day;
  date.weekday = calendar.startDate.weekday;
  date.seasonsCount = 0;
  date.weeksCount = 0;
  date.monthCount = 0;

  currentSeason = calendar.seasons[date.month];               //вспомогательные переменные
  hoursCounter = hours;
  daysCounter = 0;

  while(hoursCounter>=24){
    hoursCounter -= 24;
    date.weekday++;
    daysCounter++;
    date.day++;
    if(date.year==2012 && date.month==1){
      february=1;
    } else {february=0;}
    if(date.day>=calendar.months[date.month].days+february){
      date.day = 0;
      date.month++;
      date.monthCount++;
    }
    if(date.weekday>6){
      date.weekday=0;
      date.weeksCount++;
    }
    if(date.month>11) {
      date.month=0;
      date.year++;
    }
    if(calendar.seasons[date.month]!=currentSeason){
      currentSeason = calendar.seasons[date.month];
      date.seasonsCount++;
    }
  }
  date.daysCount = parseInt(hoursCounter/24);                 //количество прошедших дней с начала работы

  date.hour = hoursCounter;                                   //текущий час
  date.season = calendar.seasons[date.month];                 //текущий сезон

  date.shift = parseInt(date.hour/8);                         //текущая смена (от 0 до 2)

  date.brigade = brigades.schedule[daysPassed%brigades.schedule.length];  //текущая бригада

  //если не указана опция, возвращаем всё подряд
  //если указана, то только нужное значение
  if(option==""){
    return date;
  } else {
    return date[option];
  }
}

function removePostfix(str, postfix) {
  return +(str.substr(0,str.indexOf(postfix)));
}

//надо дописать, чтобы подписи часов не налезали друг на друга
//и последняя подпись не пропадала за краем графика

stopsGraph = {
  width: 0,
  height: 0,
  container: null,
  graph: null,
  state: {
    coordinates: [],
    sum: -1,
    zeroStops: -1,
    widthWithoutSpaces: -1
  },

  init: function(){
    //console.log('initializing stops graph');

    this.container = d3.select('.stopsGraph');
    this.width = removePostfix(this.container.style('width'),'px');
    this.height = removePostfix(this.container.style('height'),'px');

    this.container
      .append('svg')
      .attr('width',this.width)
      .attr('height',20);

    this.graph = this.container.select('svg');

    stops =
     [{ name: 'c3', fill: '#b44' },
      { name: 'c1', fill: '#273' },
      { name: 'c2', fill: '#744' },
      { name: 'c4', fill: '#46b' },
      { name: 'c5', fill: '#39b' }];

    stops.forEach(function(d){
      stopsGraph.graph
        .append('rect')
        .attr('class',d.name)
        .attr('x',0)
        .attr('y',0)
        .attr('width',0)
        .attr('height',3)
        .attr('fill',d.fill);

      stopsGraph.graph
        .append('text')
        .attr('class',d.name+"-text")
        .attr('x',0)
        .attr('y',18)
        .attr('fill',d.fill)
        .attr('opacity',0);
    })

    appendstring = "<div class='stopCaptions'><div id='c3' class='leftBlock'>ремонт</div>"+
      "<div id='c1' class='leftBlock'>сервис</div>"+
      "<div id='c2' class='leftBlock'>переход</div>"+
      "<div id='c4' class='leftBlock strikeout'>сырье</div>"+
      "<div id='c5' class='leftBlock strikeout last'>заказ</div>"+
      "</div>";

    $('.stopsGraph').append(appendstring);
  },

  update: function(data){
    this.getState(data);

    if(this.state.sum){

      this.container
        .style('opacity', 1);

      this.graph
        .selectAll('rect')
        .data(this.state.coordinates)
        .attr('x', function(d){
          return d.x;
        })
        .attr('width', function(d){
          return d.width;
        });

      this.graph
        .selectAll('text')
        .data(this.state.coordinates)
        .attr('x', function(d){
          return d.x;
        })
        .text(function(d){
          return d.hours;
        })
        .attr('opacity', function(d){
          a = d.hours+"";
          //console.log(a.length, d.width);
          if(d.width<(a.length*9)) return 0;

          if(d.hours) return 1;
          else return 0;
        });

      captions = d3
        .select('.stopCaptions')
        .selectAll('div')
        .data(this.state.coordinates)
        .style('opacity', function(d){
          if(d.hours) return 1;
          else return 0.2;
        })

    } else {
      this.container
        .style('opacity', 0);
    }

  },

  getState: function(data){
    this.emptyState();

    hours = [data.stopHoursC3, data.stopHoursC1, data.stopHoursC2, data.stopHoursC4, data.stopHoursC5];
    stopTypesCount = hours.length;

    this.state.sum = d3.sum(hours);
    this.state.zeroStops = hours.filter(function (d) { return d == 0 }).length;
    this.state.widthWithoutSpaces = this.width - 5*(stopTypesCount-this.state.zeroStops-1);

    currentX = 0;
    hours.forEach(function(d,i){
      if(stopsGraph.state.sum){
        pixels = Math.round( d/stopsGraph.state.sum * stopsGraph.state.widthWithoutSpaces);
        stopsGraph.state.coordinates.push({hours:d, x: currentX, width: pixels});
        if(d!=0){
          currentX += pixels + 5;
        }
      }
    })
  },

  emptyState: function(){
    this.state.coordinates = [];
    this.state.sum = -1;
    this.state.zeroStops = -1;
    this.state.widthWithoutSpaces = -1;
  }
};

productionGraph = {
  width: 0,
  height: 0,
  container: null,
  graph: null,
  rects: [
    { id: 'max', x: 0, fill: '#000', opacity: 0.1 },
    { id: 'good', x: 0, fill: '#fd6', opacity: 1 },
    { id: 'bad', x: 0, fill: '#ccb152', opacity: 1 },
    { id: 'white', x: 0, fill: '#fff', opacity: 0.5 },
    { id: 'levelGood', x: 18, fill: '#000', opacity: 0.1 },
    { id: 'levelBad', x: 18, fill: '#000', opacity: 0.1 }],
  texts: [
    { id: 'maxtext', opacity: 1, text: '100%'},
    { id: 'prod', opacity: 0, text: '-%'},
    { id: 'oee', opacity: 0, text: '-%'}
  ],

  init: function(){

    this.container = d3.select('.productionGraph');
    this.width = removePostfix(this.container.style('width'),'px');
    this.height = removePostfix(this.container.style('height'),'px');

    this.container
      .append('svg')
      .attr('width',this.width)
      .attr('height',this.height);

    this.graph = this.container.select('svg');

    this.rects.forEach(function(d){
      productionGraph.graph
        .append('rect')
        .attr('id', d.id)
        .attr('x', d.x)
        .attr('y', 0)
        .attr('width', 18)
        .attr('height', 0)
        .attr('fill',d.fill)
        .attr('opacity',d.opacity)
    });

    this.texts.forEach(function(d){
      productionGraph.graph
        .append('text')
        .attr('id',d.id)
        .attr('x',31)
        .attr('y',9)
        .text(d.text)
        .attr('opacity', d.opacity);
    })
  },

  update: function(data){
    availability = removePostfix(data.availabilityPercent,'%');
    production = removePostfix(data.productionPercent,'%');
    quality = removePostfix(data.qualityPercent,'%');

    productionPercent = Math.round(production*(availability/100))+'%';
    oeePercent = Math.round(production*(availability/100)*(quality/100))+'%';

    goodHeight = Math.round((production/100)*(availability/100)*(quality/100)*(this.height-24));
    badHeight = Math.round((production/100)*(availability/100)*(1 - (quality/100))*(this.height-24));

    goodY = this.height-goodHeight-15;
    badY = this.height-goodHeight-badHeight-15;

    rectData = [
      {y: 9, height: 1},
      {y: goodY, height: goodHeight},
      {y: badY, height: badHeight},
      {y: goodY, height: 1},
      {y: goodY, height: 1},
      {y: badY, height: 1}
    ]

    textData = [
      {y: 9, text: '100%', opacity: 1},
      {y: goodY+11, text: oeePercent+' OEE', opacity: 1},
      {y: badY-1, text: productionPercent+' П', opacity: 1}
    ]

    productionGraph.graph
      .selectAll('rect')
      .data(rectData)
      .attr('y',function(d){
        return d.y;
      })
      .attr('height',function(d){
        return d.height;
      })

    productionGraph.graph
      .selectAll('text')
      .data(textData)
      .attr('y',function(d){
        return d.y;
      })
      .text(function(d){
        return d.text;
      })
      .attr('opacity',function(d,i){
        if(i==0 && badY<23) return 0;
        return d.opacity;
      });
  }
};

function findMachineData(machine, line, block) {

  machineData = appData.machines[regime].filter(function(d){ return d.key==machine})[0].values;
  lineData = machineData.filter(function(d){ return d.key==line})[0].values;
  blockData = lineData.filter(function(d){ return d.key==block})[0].values;

  return blockData;
}

function getFullStopData(graphData, data) {
  period = graphInfo[regime].minPeriod;

  str = graphData.id.substr(graphData.id.indexOf('---')+3,1000);
  line = str.substr(0,str.indexOf('---'));
  block = str.substr(str.indexOf('---')+3,1000);
  machine = graphData.machine;

  rectData = findMachineData(machine, line, block);

  start = +data.start;
  stops = [+data.c1, +data.c2, +data.c3, +data.c4, +data.c5];
  nonzeroElementNumber = 0;
  stops.forEach(function(d,i){
    if(d!=0) nonzeroElementNumber=i;
  })

  countingStop = false;
  stopsCounter = 0;
  stopsTemp = [];
  rectData.forEach(function(d){
    if(!countingStop && +d.availability==0){
      stopsCounter++;
      countingStop = true;
      stopsTemp.push([+d.start,-1,-1,nonzeroElementNumber]);
    }
    if(countingStop && +d.availability!=0){
      stopsTemp[stopsCounter-1][1] = +d.start;
      stopsTemp[stopsCounter-1][2] = stopsTemp[stopsCounter-1][0] - stopsTemp[stopsCounter-1][1];
      countingStop = false;
    }
  })
  if(stopsTemp[stopsCounter-1][2]==-1) {
    stopsTemp[stopsCounter-1][1] = +rectData[rectData.length-1].start;
    stopsTemp[stopsCounter-1][2] = stopsTemp[stopsCounter-1][0] - stopsTemp[stopsCounter-1][1] + 1;
  }

  finalStop = -1;
  stopsTemp.forEach(function(d){
    if(d[0]>=start && d[1]<=start) finalStop = d;
  })

  return finalStop;
}

//Возвращает данные для левой колонки
//action – 'graphHover','tableClick'
//data - данные столбца на графике. если нет, указать 'none'

//graphInfo - данные о блоке графика. поля sector, machine, id и x
//заполняем его даже если обновление по клику в таблице
//в этом случае id и x останутся пустыми
function getLeftBlockData(action,data,graphData){
  leftBlockData = {
    dateSelectorText: "",
    currentTime: "",
    planProduction: "",
    badProduction: "",
    goodProduction: "",
    factProduction: "",
    planTime: "",
    factTime: "",
    stopTime: "",
    availabilityPercent: "",
    productionPercent: "",
    qualityPercent: "",
    oeePercent: "",
    stopHoursC1: "",
    stopHoursC2: "",
    stopHoursC3: "",
    stopHoursC4: "",
    stopHoursC5: ""
  }

  date = getDate(35039 - (+data.start),"");

  //определяем дату для бокса
  leftBlockData.dateSelectorText = appSettings.dateSelectorText[regimeCode];    //дата по умолчанию, если обновляем не при наведении на график

  if(action=='graphHover'){
    date = graphData.id;
    date = date.substr(date.indexOf('---')+3,1000);
    date = date.substr(date.indexOf('---')+3,1000);

    period = graphInfo[regime].minPeriod;

    //определяем дату
    if(regimeCode){
      monthNumber = +date.substr(5,1000);
      monthName = calendar.months[monthNumber].nameRoditelniyPadezh;
      day = Math.floor(graphData.x/6)+1;
      if(monthNumber>6){
        date = day+" "+monthName + " 2014 г.";
      } else {
        date = day+" "+monthName + " 2014 г."
      }
    } else {
      dayNumber = +date.substr(3,date.indexOf('-')-3)+1;
      date = dayNumber+" июля 2015 г.";
    }
    leftBlockData.dateSelectorText = date;                                                    //дата

    //определяем время
    var start = (24-((+data.start)%24+period));
    var finish = (24-(+data.start)%24);
    leftBlockData.currentTime = start + "−" + finish;     //время
  } else {

    //если мы обновляем данные не при наведении
    periods = {
      m1: 24*31,
      m12: 24*365
    }
    period = periods[regime];
  }

  //запоминаем максимальную производительность в тоннах
  productionPerHour = 0;
  machinesCount = 1;
  if(graphData.machine=="-" && graphData.sector=="-"){
    productionPerHour = facilityInfo.production;
    machinesCount = facilityInfo.machines;
  } else if (graphData.machine!="-") {
    productionPerHour = machineInfo[graphData.machine].production;
  } else {
    productionPerHour = sectorsInfo[graphData.sector].production;
    machinesCount = sectorsInfo[graphData.sector].machines;
  }

  //вычисляем производительность в тоннах
  leftBlockData.planProduction = Math.round(productionPerHour*period);
  leftBlockData.factProduction = Math.round(((+data.production)/100)*((+data.availability)/100)*productionPerHour*period);
  leftBlockData.goodProduction = Math.round(leftBlockData.factProduction*((+data.quality)/100));
  leftBlockData.badProduction = Math.round(leftBlockData.factProduction*((100-(+data.quality))/100));

  leftBlockData.planProduction += ""; leftBlockData.planProduction = leftBlockData.planProduction.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " т"; //добавляем пробелы между разрядами
  leftBlockData.factProduction += ""; leftBlockData.factProduction = leftBlockData.factProduction.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " т";
  leftBlockData.goodProduction += ""; leftBlockData.goodProduction = leftBlockData.goodProduction.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " т";
  leftBlockData.badProduction += ""; leftBlockData.badProduction = leftBlockData.badProduction.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " т";

  //вычисляем время
  leftBlockData.planTime = Math.round(period*machinesCount);
  leftBlockData.factTime = Math.round(leftBlockData.planTime * (+data.availability)/100);
  leftBlockData.stopTime = Math.round(leftBlockData.planTime - leftBlockData.factTime);

  leftBlockData.planTime += ""; leftBlockData.planTime = leftBlockData.planTime.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " ч";
  leftBlockData.factTime += ""; leftBlockData.factTime = leftBlockData.factTime.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " ч";
  leftBlockData.stopTime += ""; leftBlockData.stopTime = leftBlockData.stopTime.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " ч";

  leftBlockData.availabilityPercent = (+data.availability) + "%";
  leftBlockData.productionPercent = (+data.production) + "%";
  leftBlockData.qualityPercent = (+data.quality) + "%";

  leftBlockData.oeePercent = Math.round(((+data.availability)/100)*((+data.production)/100)*((+data.quality)/100)*100);
  leftBlockData.oeePercent = leftBlockData.oeePercent + "%";

  leftBlockData.stopHoursC1 = +data.c1;
  leftBlockData.stopHoursC2 = +data.c2;
  leftBlockData.stopHoursC3 = +data.c3;
  leftBlockData.stopHoursC4 = +data.c4;
  leftBlockData.stopHoursC5 = +data.c5;

  //Если доступность == 0, нужно найти суммарный простой за день, а не за 1 час
  fullStopData = -1;
  if(!(+data.availability)) {
    fullStopData = getFullStopData(graphData, data);

    var start = (24-fullStopData[0]%24-period)
    var finish = (24-fullStopData[0]%24-period+fullStopData[2]%24);
    if (finish === 0) {
      finish = 24;
    }
    leftBlockData.currentTime = start + '−' + finish;
    leftBlockData.planTime = fullStopData[2]+' ч';
    leftBlockData.stopTime = fullStopData[2]+' ч';
    leftBlockData.planProduction = Math.round(productionPerHour*period)*fullStopData[2];
    leftBlockData.planProduction += ""; leftBlockData.planProduction = leftBlockData.planProduction.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " т";
    leftBlockData['stopHoursC'+(fullStopData[3]+1)] = fullStopData[2];
  }

  return leftBlockData;
}

function writeLeftColumnData(data){
  $('.dateSelector .text').html(data.dateSelectorText);
  $('.currentTime .time').html(data.currentTime);
  $('.currentTime').css('display', data.currentTime ? 'block' : 'none');

  $('.tableParameters #plan').html(data.planProduction);
  $('.tableParameters #defective').html(data.badProduction);
  $('.tableParameters #production').html(data.goodProduction);
  $('.tableParameters #fact').html(data.factProduction);

  $('.tableParameters #plantime').html(data.planTime);
  $('.tableParameters #facttime').html(data.factTime);
  $('.tableParameters #stoptime').html(data.stopTime);

  $('.parametersTable #d').html(data.availabilityPercent);
  $('.parametersTable #p').html(data.productionPercent);
  $('.parametersTable #q').html(data.qualityPercent);

  $('.oee #oee').html(data.oeePercent);
}

function updateLeftColumn(action,data,id,x){
  graphData = {};
  graphData.machine = $('.maintable .pressed').attr('machine');
  graphData.sector = $('.maintable .pressed').attr('sector');

  if(action=='graphHover'){
    graphData.id = id;
    graphData.x = x;
  } else {
    if(graphData.machine=='-' && graphData.sector=='-'){
      data = appData.table['m1'][0];
    } else if (graphData.machine!='-') {
      appData.table['m1'].forEach(function(d){
        if(d.id==graphData.machine){
          data = d;
        }
      })
    } else {
      appData.table['m1'].forEach(function(d){
        if(d.id==graphData.sector){
          data = d;
        }
      })
    }
  }

  leftBlockData = getLeftBlockData(action,data,graphData);
  writeLeftColumnData(leftBlockData);
  stopsGraph.update(leftBlockData);
  productionGraph.update(leftBlockData);
}

//положение переключателя периода
//m1 – месяц (regimeCode 0)
//m12 – год (regimeCode 1)
regime = "m1";
regimeCode = 0;

//хранит все данные
appData = {
  machines: {
    m1:null,
    m12:null
  },
  sectors: {
  	m1:null,
    m12:null
  },
  facility: {
  	m1:null,
    m12:null
  },
  table: {
  	m1:null,
    m12:null
  },

  //загружает и группирует данные графиков
  load: function(type,mode){
    d3.csv('../data/'+type+mode+'.csv', function(data){
      nest =
        d3
        .nest()
        .key(function(d) { return d.id})
        .key(function(d) { return groupBy[mode+"0"](35039-(d.start))})
        .key(function(d) { return groupBy[mode+"1"](35039-(d.start))});
      appData[type][mode] = nest.entries(data);
      reverseArray(type,mode);
    });
  },

  //загружает данные таблицы
  loadTable: function(mode, isLast){
    d3.csv('../data/table'+mode+'.csv', function(data){
      appData.table[mode] = data;
      if (isLast) {
        $('.loading-cover').fadeOut('fast');
        table.draw();
        createGraphBlocks("facility","");
      }
    });
  }
};

//группирует данные по заданным параметрам (ниже)
function getGroup(hours,groups){
  groups.forEach(function(d,i){
    groups[i] = groups[i]+getDate(hours,d);
  });
  return groups.join("-");
}

//параметры группировки данных
//m10,m11 – группировка месяца по неделям и дням
//m120,m121 - год по сезонам и месяцам
//m480,m481 - 4 года по годам и месяцам
groupBy = {
  m10: function(hours){
    groups = ["weeksCount","year"];
    return getGroup(hours,groups);
  },
  m11: function(hours){
    groups = ["day","weekday"];
    return getGroup(hours,groups);
  },
  m120: function(hours){
    groups = ["seasonsCount"];
    return getGroup(hours,groups);
  },
  m121: function(hours){
    groups = ["month"];
    return getGroup(hours,groups);
  },
  m480: function(hours){
    groups = ["year"];
    return getGroup(hours,groups);
  },
  m481: function(hours){
    groups = ["month"];
    return getGroup(hours,groups);
  }
}

function compareNumbers(a,b){
  return (35039-(+a.start))-(35039-(+b.start));
}

//переворачивает массив со сгруппированными данными
function reverseArray(type,mode){
  appData[type][mode].forEach(function(d){
    linesData = d.values.reverse();
    linesData.forEach(function(lineData){
      blocksData = lineData.values.reverse();
      blocksData.forEach(function(blockData){
        //rectData = blockData.values.reverse();
        rectData = blockData.values.sort(compareNumbers)
        //if(type=='facility' && mode=='m1') console.log('sorted rectData'+blockData.key, rectData);
      })
    })
  })
}

//выбирает какой график перерисовать при переключении периода
//и перерисовывает
function redrawGraph(){
  if($('.graphContainer').hasClass('facility')) {
    createGraphBlocks("facility", "");
    //prepareGraphData3("facility",regime,"","draw");
  }
  if($('.graphContainer').hasClass('sector')) {
    sector = $('.maintable .pressed').attr('sector');
    createGraphBlocks("sectors", sector);
    //prepareGraphData3("sectors",regime,sector,"draw");
  }
  if($('.graphContainer').hasClass('machine')) {
    machine = $('.maintable .pressed').attr('machine');
    createGraphBlocks("machines", machine);
    //prepareGraphData3("machines",regime,machine,"draw");
  }
}

selectorClick = function(){
  regimeCode = (regimeCode+1)%2;
  regime = appSettings.regimes[regimeCode];
  $('.day').toggleClass('hidden');
  $('.dateSelector .text').html(appSettings.dateSelectorText[regimeCode]);
  $('.selectorBlock img').attr('src',appSettings.switcherPictures[regimeCode]);
  $('.selectorBlock .active').removeClass('active');
  $('.selectorBlock #' + regime).addClass('active');
  redrawGraph();
}

$(document).ready(function(){
  loadList = [
    ['machines','m1'],
    ['sectors','m1'],
    ['facility','m1'],
    ['machines','m12'],
    ['sectors','m12'],
    ['facility','m12']];

  loadList.forEach(function(d){
    appData.load(d[0],d[1]);
  })

  appData.loadTable("m1", true);

  //drawLegendProductionGraph();
  productionGraph.init();
  stopsGraph.init();

  //переключает период по клику и перерисовывает график
  $('.selectorBlock').click(selectorClick);
})

table = {
  draw: function(){

    captions = [["%"," ч"," т"," руб."],["","","",""]];

    $('.table').append('<table class="maintable"><tbody></tbody></table>');
    tablebody = $('.maintable tbody');

    //Заголовок таблицы
    appendstring =
        "<tr class='header' machine='-' sector='-'>"+
        "<td class='name'></td>"+
        "<td class='OEE'></td><td class='vtext' id='OEE'><span class='shift1 smallcaps'>OEE</span></td>"+    //надпись ОЭО в ячейке .vtext с отрицательным сдвигом
        "<td class='availability smallcaps'>Д</td><td class='vtext'></td>"+
        "<td class='production smallcaps'>П</td><td class='vtext'></td>"+
        "<td class='quality smallcaps'>К</td><td class='vtext' id='qual'></td>"+
        "<td>Время работы, ч</td>"+
        "<td>Объем произ-ва, т</td>"+
        "<td class='lostprofit'></td><td class='vtext'><span class='shift2'>Упущ. выгода</span></td>"+
        "</tr>";
    tablebody.append(appendstring);

    appendstring =
        "<tr class='headerCaptions' machine='-' sector='-'>"+
        "<td class='name'></td>"+
        "<td class='OEE'></td><td class='vtext' id='OEE'></td>"+    //надпись ОЭО в ячейке .vtext с отрицательным сдвигом
        "<td class='availability'></td><td class='vtext'></td>"+
        "<td class='production'></td><td class='vtext'></td>"+
        "<td class='quality'></td><td class='vtext' id='qual'></td>"+
        "<td>"+
        "<table class='innertable'><tr>"+
        "<td id='plantime'>план</td><td id='facttime'>факт</td><td id='stoptime'>простой</td>"+
        "</tr></table>"+
        "</td>"+
        "<td>"+
        "<table class='innertable'><tr>"+
        "<td id='planproduction'>план</td><td id='factproduction'>факт</td><td id='badproduction'>брак</td>"+
        "</tr></table>"+
        "</td>"+
        "</tr>";
    tablebody.append(appendstring);

    //начинаем рисовать остальные строки таблицы
    //для этого пробегаем по всем строчкам в файле с данными
    //они в том же порядке, в каком выводятся строки таблицы
    lastId = "";
    appData.table[regime].forEach(function(row){
      debugger
      //если на прошлой строке закончился список машин цеха,
      //добавляем строку с пробелом
      if ((row.id.length==2 && lastId!="facility") || (row.id.substr(2,3)=='-br' && lastId.substr(2,3)!='-br')) {
        tablebody
          .append("<tr class='space hidden' sector='"+lastId.substr(0,2)+"'><td class='name'></td>"+
          +"<td class='OEE'></td><td class='vtext' id='OEE'> </td>"+
          +"<td class='availability'></td><td class='vtext'> </td>"+
          +"<td class='production'></td><td class='vtext'> </td>"+
          +"<td class='quality'></td><td class='vtext' id='qual'></td>"+
          +"<td>"+
          +"<table class='innertable'><tr>"+
          +"<td class='plan' id='plantime'></td><td class='fact' id='facttime'></td><td class='stop' id='stoptime'></td>"+
          +"</tr></table>"+
          +"</td>"+
          +"<td>"+
          +"<table class='innertable'><tr>"+
          +"<td class='planprod' id='planproduction'></td><td class='volume' id='factproduction'></td><td class='defective' id='badproduction'></td>"+
          +"</tr></table>"+
          +"</td>"+
          +"<td class='lostprofit'></td><td class='vtext'>  </td></tr>");
      }

      brigadeClass = "";
      //если сейчас строка производства, добавляем знаки % и всё вот это вот
      if(row.id=="facility"){
        valCaptions = captions[0];
        name="ЗАВОД";
        trClass = "facility pressed bold";
        innerTableClass = "bold";
        nameClass = 'name smallcaps';
        machine = "-";
        sector = "-";
        lastId = 'facility';
        //stoptime = row.pno; stoptime += "";
        //planproduction = (+row.ppv)*facilityInfo.production;
      } else if(row.id.length==2) {
        //если сейчас строка цеха, убираем знаки % итд, делаем надпись жирной

        valCaptions = captions[1];
        name=sectorsInfo[row.id].name;
        trClass = "sector bolder";
        nameClass = 'name';
        innerTableClass = "bold";
        machine = "-";
        sector = row.id;
        lastId = sector;
        //stoptime = row.pno; stoptime += "";
        //planproduction = (+row.ppv)*sectorsInfo[sector].production;
      } else {
        //если сейчас строка машины, убираем знаки % итд, делаем надпись жирной

        if(row.id.substr(2,3)=='-br'){
          brigadeClass = row.id.substr(row.id.indexOf('-')+1,1000);
        }

        valCaptions = captions[1];
        if(row.id.substr(2,4)=='-br1'){
          name = machineInfo[row.id].name[0] + " " + machineInfo[row.id].name[1];
        } else {
          if(row.id[row.id.length-1]=='0' && row.id.substr(0,2)!="cl"){
            name = machineInfo[row.id].name[0] + " " + machineInfo[row.id].name[1];
          } else if(row.id.substr(0,2)!="cl"){
            name=machineInfo[row.id].name[0];
          } else if (row.id.substr(0,2)=="cl") {
            name=machineInfo[row.id].name[1];
          }
        }
        trClass = "machine hidden";
        nameClass = 'name';
        innerTableClass = "";
        machine = row.id;
        sector = row.id.substr(0,2);
        lastId = machine;
        //stoptime = (+row.c1)+(+row.c2)+(+row.c3)+(+row.c4)+(+row.c5);
        //stoptime += "";
        //planproduction = (+row.ppv)*machineInfo[machine].production;
      }

      oee = Math.round(row.availability*row.production*row.quality/10000);

      //facttime = (+row.ppv)-(+row.pno);
      //facttime += "";
      //planproduction = Math.round(planproduction) + "";
      productionplan = Math.round(+row.productionplan)+"";
      stoptime = Math.round((+row.plantime) - (+row.facttime))+"";

      productionfact = Math.round((+row.productionplan)*(+row.availability)*(+row.production)/10000)+"";
      productionfactInt = Math.round((+row.productionplan)*(+row.availability)*(+row.production)/10000);
      productionbad = Math.round(productionfactInt*(100-(+row.quality))/100)+"";
      //остальные строчки таблицы
      appendstring =
        "<tr class='"+trClass+"' machine='"+machine+"' sector='"+sector+"' id='" + row.id + "'>"+
        "<td class='"+nameClass+"'><span class='"+brigadeClass+"'>"+name+"</span></td>"+
        "<td class='OEE'>"+oee+"</td><td class='vtext' id='OEE'>"+valCaptions[0]+"</td>"+
        "<td class='availability'>"+row.availability+"</td><td class='vtext'>"+valCaptions[0]+"</td>"+
        "<td class='production'>"+row.production+"</td><td class='vtext'>"+valCaptions[0]+"</td>"+
        "<td class='quality'>"+row.quality+"</td><td class='vtext' id='qual'>"+valCaptions[0]+"</td>"+
        "<td>"+
        "<table class='innertable'><tr>"+
        "<td class='plan "+innerTableClass+"' id='plantime'>"+row.plantime.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')+"</td>"+
        "<td class='"+innerTableClass+"'id='facttime'>"+row.facttime.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')+"</td>"+
        "<td class='stop "+innerTableClass+"' id='stoptime'>"+stoptime.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')+"</td>"+
        "<td class='stop-graph'></td>"+
        "</tr></table>"+
        "</td>"+
        "<td>"+
        "<table class='innertable'><tr>"+
        "<td class='"+innerTableClass+"' id='planproduction'>"+productionplan.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')+"</td>"+
        "<td class='volume "+innerTableClass+"' id='factproduction'>"+productionfact.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')+"</td>"+
        "<td class='defective "+innerTableClass+"' id='badproduction'>"+productionbad.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')+"</td>"+
        "</tr></table>"+
        "</td>"+
        "<td class='lostprofit'>"+row.up.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')+"</td><td class='vtext rub'>"+valCaptions[3]+"</td>"+
        "</tr>";

      tablebody.append(appendstring);

      var stops = [
        { name: 'c3', fill: '#b44', title: ' ч. ремонта', value: +row.c3 },
        { name: 'c1', fill: '#273', title: ' ч. сервиса', value: +row.c1 },
        { name: 'c2', fill: '#744', title: ' ч. меняли режим работы', value: +row.c2 },
        { name: 'c4', fill: '#46b', title: ' ч. ждали сырьё', value: +row.c4 },
        { name: 'c5', fill: '#39b', title: ' ч. не было заказа', value: +row.c5 }
      ];

      var stopGraph = d3.select('.maintable tbody #' + row.id + ' .stop-graph')
        .append('svg')
        .attr('width', '50px')
        .attr('height', '5px');

      var overallStops = d3.sum(stops, function(s) { return s.value; });
      var padding = 1;
      var trueWidth = 50 - (_.compact(_.pluck(stops, 'value')).length - 1) * padding;

      stopGraph
        .selectAll('rect')
        .data(stops)
        .enter()
        .append('rect')
        .attr('x', function(d) {
          if (d.name === 'c3') {
            return 0;
          } else if (d.name === 'c1') {
            return (row.c3 / overallStops) * trueWidth + (+row.c3 ? padding : 0);
          } else if (d.name === 'c2') {
            return (row.c3 / overallStops) * trueWidth + (+row.c3 ? padding : 0) + (row.c1 / overallStops) * trueWidth + (+row.c1 ? padding : 0);
          } else if (d.name === 'c4') {
            return (row.c3 / overallStops) * trueWidth + (+row.c3 ? padding : 0) + (row.c1 / overallStops) * trueWidth + (+row.c1 ? padding : 0) + (row.c2 / overallStops) * trueWidth + (+row.c2 ? padding : 0);
          } else {
            return (row.c3 / overallStops) * trueWidth + (+row.c3 ? padding : 0) + (row.c1 / overallStops) * trueWidth + (+row.c1 ? padding : 0) + (row.c2 / overallStops) * trueWidth + (+row.c2 ? padding : 0) + (row.c4 / overallStops) * trueWidth + (+row.c4 ? padding : 0);
          }
        })
        .attr('y', 0)
        .attr('width', function(d) {
          return (row[d.name] / overallStops) * trueWidth;
        })
        .attr('height', '100%')
        .attr('fill', function(d) {
          return d.fill;
        })
        .on('mousemove', function(d) {
          $('.tooltip').css({'display': 'block', 'top': (d3.event.pageY - 21) + 'px', 'left': (d3.event.pageX - 3) + 'px', 'color': d.fill}).text(d.value + d.title);
        })
        .on('mouseleave', function(d) {
          $('.tooltip').css({'display': 'none'});
        });
    })

    this.bindClick();
  },

  facilityActions: function(object){
    $('h1').html('Экстрамаслопродукт');

    row = $(object.currentTarget);
    machine = $('.maintable .machine');

    $('.maintable .pressed').toggleClass('pressed');
    row.toggleClass('pressed');
    row.toggleClass('opened');

    if(row.hasClass('opened')){
      machine.attr('class','machine');
      $(".space").attr('class','space');
    } else {
      machine.attr('class','machine hidden');
      $(".space").attr('class','space hidden');
    }

    updateGraphBlocks('facility','');
    updateLeftColumn('tableClick',"","","");

    $('.graph .sector').attr('class','graphContainer leftBlock');
    $('.graph .machine').attr('class','graphContainer leftBlock');
    $('.graphContainer').attr('class','graphContainer leftBlock facility');
  },

  sectorActions: function(object){
    row = $(object.currentTarget);
    facility = $('.maintable .facility');


    var pressed = false;
    sector = row.attr('sector');
    $('h1').html(sectorsInfo[sector].name);
    if(row.hasClass('pressed')){
      pressed = true;
    }

    $('.maintable .pressed').toggleClass('pressed');
    row.attr('class','sector bolder pressed');

    $(".machine[sector!="+sector+"]").attr('class','machine hidden');
    $(".space[sector!="+sector+"]").attr('class','space hidden');

    $(".machine[sector="+sector+"]").toggleClass('hidden');
    $(".space[sector="+sector+"]").toggleClass('hidden');

    updateGraphBlocks("sectors", sector);
    updateLeftColumn('tableClick',"","","");

    $(".graph .facility").attr('class','graphContainer leftBlock');
    $(".graph .machine").attr('class','graphContainer leftBlock');
    $(".graphContainer").attr('class','graphContainer leftBlock sector');
  },

  machineActions: function(object){
    row = $(object.currentTarget);
    $(".maintable .pressed").toggleClass('pressed');
    row.toggleClass('pressed');

    machine = row.attr('machine');
    $('h1').html(machineInfo[machine].name[1] === "бригада" ? machineInfo[machine].fullName : machineInfo[machine].name[0]+" "+machineInfo[machine].name[1]);

    //prepareGraphData3("machines",regime,machine,"update");
    updateGraphBlocks("machines", machine);
    updateLeftColumn('tableClick',"","","");

    $(".graph .sector").attr('class','graphContainer leftBlock');
    $(".graph .facility").attr('class','graphContainer leftBlock');
    $(".graphContainer").attr('class','graphContainer leftBlock machine');

  },

  bindClick: function(){
    $('.maintable .facility').click(function(eventObject){ table.facilityActions(eventObject); });
    $('.maintable .sector').click(function(eventObject){ table.sectorActions(eventObject); });
    $('.maintable .machine').click(function(eventObject){ table.machineActions(eventObject); });
  }
}
