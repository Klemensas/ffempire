(function () {
  function GameTour($timeout, Restaurant, Building, $state) {
    let kitchen = {};
    const template = `<div class='popover tour'><div class='arrow'></div><h3 class='popover-title'></h3>
    <div class='popover-content'></div><div class='popover-navigation clearfix'>%nav%</div></div>`;
    const navigation = {
      none: '',
      next: '<button class="btn btn-default pull-right" data-role="next">Next <i class="fa fa-angle-right"></i></button>',
      ok: '<button class="btn btn-default pull-right" data-role="end">Ok <i class="fa fa-angle-right"></i></button>',
    };
    const tour = new Tour({
      backdrop: true,
      backdropContainer: 'body',
      keyboard: false,
      onShown: checkReqs,
      template: template.replace('%nav%', navigation.next),
      steps: [
        { // 0
          orphan: true,
          container: 'body',
          title: 'Welcome to Fast Food Empire',
          content: `This introduction will help you get started with the game.<br><br>This
          is your main restaurant interface, click next to continue.`,
        },
        { // 1
          backdropPadding: 5,
          placement: 'bottom',
          element: '#resources',
          title: 'Resources',
          content: `These are your main resources, they're as follows:<br>
          Megabucks - money mostly used by building upgrades. Produced by selling your food resources,<br>
          Burgers, Drinks, Fries - food resources, produced by kitchen workers and heavily used when recruiting workers,<br>
          Loyals - loyal customers, used to recruit workers and lost when making changes to your restaurant<br>`,
        },
        { // 2
          backdropPadding: 5,
          placement: 'bottom',
          element: '#money-produced',
          title: 'Megabucks production',
          content: `You can use this slider to set what percentage of your produced burgers, drinks and fries
          get convert into megabucks.<br><br> Each food is worth 0.5 megabucks.`,
        },
        { // 3
          placement: 'right',
          element: '#building-list',
          title: 'Buildings',
          content: `Here you see all the buildings available for you to build.<br><br>
          New buildings will appear once you satisfy their requirements to build.`,
        },
        { // 4
          orphan: true,
          container: 'body',
          title: 'Workers',
          content: `To build your first workers you need to have a level 2 kitchen.<br><br>
          Lets upgrade it now.`,
        },
        { // 5
          backdropPadding: 5,
          placement: 'bottom',
          element: '#building-list #kitchen .resource-column',
          template: template.replace('%nav%', navigation.none),
          title: 'Kitchen upgrade',
          content: `Here you can see the time it will take and the resources it costs
          to perform the upgrade.<br><br>Click the Build button to continue.`,

        },
        { // 6
          backdropPadding: 5,
          placement: 'bottom',
          element: '#building-list #kitchen .resource-column',
          template: template.replace('%nav%', navigation.none),
          title: 'Kitchen upgrade further',
          content: `Your building upgrade was queued.<br> Lets build another level
          while we're at it - we're gonna need it later.`,
        },
        { // 7
          placement: 'bottom',
          element: '#building-queue',
          title: 'Building queue',
          content: `Here you can see what buildings you have queued to be upgraded.<br><br>
          Only one building is built at a time, so further building time gets extended by
          time left for the current building.<br><br>While we are waiting lets explore the map.`,
        },
        { // 8
          backdropPadding: { top: 10, bottom: 10, right: 0 },
          placement: 'bottom',
          element: '#game-navigation',
          template: template.replace('%nav%', navigation.none),
          title: 'Navigation',
          content: `Here you can navigate game views, currently you're in the restaurant view.<br><br>
          Go to map view to continue.`,
        },
        { // 9
          backdropPadding: 40,
          placement: 'right',
          element: '#map',
          title: 'Map',
          content: `This is the game map. You can view all and interact with any restaurant from here.
          <br><br> Your restaurants are marked by a yellow color.`,
        },
        { // 10
          backdropPadding: 40,
          placement: 'right',
          element: '#map',
          title: 'Map',
          content: `Map coordinates are displayed on the left-Y and bottom-X sides.<br><br>
          You can use the arrows to navigate the map.<br><br> When you hover over a restaurant you can
          send your workers there, but you need to have some workers first.`,
        },
        { // 11
          orphan: true,
          container: 'body',
          template: template.replace('%nav%', navigation.ok),
          title: 'Progress',
          content: `Lets see how our building queue is doing.<br><br>Switch back to restaurant view and
          we will continue once your level 2 kitchen is complete.`,
        },
        { // 12
          backdropPadding: 5,
          placement: 'bottom',
          element: '#worker-training',
          template: template.replace('%nav%', navigation.none),
          title: 'Worker training',
          content: `Now you are able to train your first workers. Worker training button toggles this menu.
          <br><br>The first three workers you can train produce valuable resources for you.
          To continue queue 2 of each, this will help boost our resource production.`,
        },
        { // 13
          backdropPadding: 5,
          placement: 'bottom',
          element: '#worker-training',
          template: template.replace('%nav%', navigation.ok),
          title: 'Worker training',
          content: `Great, your resource production will get a boost once the workers are trained.<br><br>
          To continue the tutorial save resources and reach level 5 kitchen.`,
        },
      ] });

    const requirements = {
      5: { target: 'kitchen', queue: 'building', type: 'queue', level: 2 },
      6: { target: 'kitchen', queue: 'building', type: 'queue', level: 3 },
      8: { view: 'game.map', type: 'view' },
      12: {
        target: [
          { name: 'burger flipper', amount: 2 },
          { name: 'fry fryer', amount: 2 },
          { name: 'drink pourer', amount: 2 },
        ],
        queue: 'unit',
        type: 'queue',
      },
    };
    let finished = false;

    function checkReqs(t, scope) {
      const storage = t._options.storage;
      const ended = storage.tour_end;
      const step = +storage.tour_current_step;
      if (step === 12 && scope) { // enable worker training menu
        scope.trainingActive = true;
        return;
      }
      if (step === 11 && ended && kitchen.level >= 2 && $state.current.name === 'game.restaurant') {
        delete storage.tour_end;
        t.goTo(12);
      }
      const reqs = requirements[step];
      if (reqs) {
        switch (reqs.type) {
          case 'queue':
            if (reqs.queue === 'building') {
              if (reqs.target === 'kitchen' && (kitchen.level + kitchen.queued) >= reqs.level) {
                t.next();
              }
            }
            if (reqs.queue === 'unit') {
              // console.log(Restaurant.activeRest.workers.kitchen.find)
            }
            break;
          case 'view':
            if (reqs.view === $state.current.name) {
              t.next();
            }
            break;
          default:
            console.error('How?');
        }
      }
    }

    function startTour(scope) {
      console.log(Restaurant.activeRest);
      kitchen = Restaurant.activeRest.buildings.find(b => b.title === 'kitchen');

      if (finished || kitchen.level > 5) { finished = true; return; }

      tour.init();
      if (!tour.ended() && !tour.getCurrentStep() && $state.current.name !== 'game.restaurant') {
        return $state.go('game.restaurant');
      }
      checkReqs(tour, scope);
      tour.start();
    }

    return {
      startTour,
      // allWorkers,
      // canTrain,
      // getWorkerData,
      // hireAttempt,
      // kitchenWorkers,
      // outsideWorkers,
      // outsideWorkerMap,
      // sendWorkers,
      // canTrainAny: canTrain,
    };
  }

  angular.module('faster')
    .factory('GameTour', GameTour);
}());

