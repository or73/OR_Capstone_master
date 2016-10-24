Router.configure({
					layoutTemplate: 'ApplicationLayout'
				});

Router.route('/',
			function()
			{
				this.render('welcome',
							{
								to: "navbar"
							});
			});

Router.route('/login',
			function()
			{
				this.render('navbar',
							{
								to: "navbar"
							});
				this.render('filesList',
							{
								to: "main"
							})
			});