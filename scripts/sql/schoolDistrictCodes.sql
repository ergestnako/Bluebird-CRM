DROP TABLE IF EXISTS nyss_schooldistricts;

CREATE TABLE nyss_schooldistricts (
  Code VARCHAR(5) NOT NULL,
  DistrictName VARCHAR(100) NOT NULL,
  PRIMARY KEY (Code)
);

INSERT INTO nyss_schooldistricts (Code, DistrictName)
VALUES
  ("001","Addison"),
  ("002","Adirondack"),
  ("003","Afton"),
  ("004","Akron"),
  ("005","Albany"),
  ("006","Albion"),
  ("007","Alden"),
  ("008","Alexander"),
  ("009","Alexandria"),
  ("010","Alfred-Almond"),
  ("011","Allegany-Limestone"),
  ("012","Altmar-Parish-Williamstown"),
  ("013","Amagansett"),
  ("014","Amityville"),
  ("015","Amsterdam"),
  ("016","Andes"),
  ("017","Andover"),
  ("018","Genesee Valley"),
  ("019","Ardsley"),
  ("020","Argyle"),
  ("021","Arkport"),
  ("022","Arlington"),
  ("023","Byram Hills"),
  ("024","Attica"),
  ("025","Auburn"),
  ("026","AuSable Valley"),
  ("027","Averill Park"),
  ("028","Avoca"),
  ("029","Avon"),
  ("030","Babylon"),
  ("031","Bainbridge-Guilford"),
  ("032","Baldwin"),
  ("033","Baldwinsville"),
  ("034","Ballston Spa"),
  ("035","Barker"),
  ("036","Batavia"),
  ("037","Bath"),
  ("038","Bay Shore"),
  ("039","Bayport-Blue Point"),
  ("040","Beacon"),
  ("041","Beaver River"),
  ("042","Bedford"),
  ("043","Beekmantown"),
  ("044","Belfast"),
  ("045","Belleville Henderson"),
  ("046","Bellmore"),
  ("047","Genesee Valley"),
  ("048","Bemus Point"),
  ("049","Berlin"),
  ("050","Berne-Knox-Westerlo"),
  ("051","Bethlehem"),
  ("052","Bethpage"),
  ("053","Binghamton"),
  ("054","Bolivar-Richburg"),
  ("055","Bolton"),
  ("057","Bradford"),
  ("058","Brasher Falls"),
  ("059","Brentwood"),
  ("060","Brewster"),
  ("061","Briarcliff Manor"),
  ("062","Bridgehampton"),
  ("063","Brighton"),
  ("064","Brunswick (Brittonkill)"),
  ("065","Broadalbin-Perth"),
  ("066","Brockport"),
  ("067","Brocton"),
  ("068","Bronx"),
  ("069","Bronxville"),
  ("070","Brookfield"),
  ("071","Brooklyn"),
  ("072","Brushton-Moira"),
  ("073","Buffalo"),
  ("074","Burnt Hills-Ballston Lake"),
  ("075","Byron-Bergen"),
  ("076","Cairo-Durham"),
  ("077","Caledonia-Mumford"),
  ("078","Cambridge"),
  ("079","Camden"),
  ("080","Campbell-Savona"),
  ("081","Canajoharie"),
  ("082","Canandaigua"),
  ("083","Canaseraga"),
  ("084","Canastota"),
  ("085","Candor"),
  ("086","Canisteo-Greenwood"),
  ("087","Canton"),
  ("088","Carle Place"),
  ("089","Carmel"),
  ("090","Carthage"),
  ("091","Cassadaga Valley"),
  ("092","Cato-Meridian"),
  ("093","Catskill"),
  ("094","Cattaraugus-Little Valley"),
  ("095","Cazenovia"),
  ("096","Center Moriches"),
  ("097","Central Islip"),
  ("098","Central Square"),
  ("100","Chappaqua"),
  ("101","Charlotte Valley"),
  ("102","Chateaugay"),
  ("103","Chatham"),
  ("104","Chautauqua Lake"),
  ("105","Chazy"),
  ("106","Cheektowaga"),
  ("107","Chenango Forks"),
  ("108","Chenango Valley"),
  ("110","Chester"),
  ("111","Chittenango"),
  ("112","Churchville-Chili"),
  ("113","Cincinnatus"),
  ("114","Clarence"),
  ("115","Cleveland Hill"),
  ("116","Clifton-Fine"),
  ("117","Clinton"),
  ("118","Clyde-Savannah"),
  ("119","Clymer"),
  ("120","Cobleskill-Richmondville"),
  ("122","Cohoes"),
  ("123","Cold Spring Harbor"),
  ("124","Colton-Pierrepont"),
  ("125","Commack"),
  ("126","Comsewogue"),
  ("127","Connetquot"),
  ("128","Cooperstown"),
  ("129","Copenhagen"),
  ("130","Copiague"),
  ("131","Corinth"),
  ("132","Corning-Painted Post"),
  ("133","Cornwall"),
  ("134","Cortland"),
  ("135","Coxsackie-Athens"),
  ("136","Croton-Harmon"),
  ("137","Crown Point"),
  ("138","Cuba-Rushford"),
  ("140","Dansville"),
  ("141","DeRuyter"),
  ("142","Deer Park"),
  ("143","Sullivan West"),
  ("144","Delhi"),
  ("145","Depew"),
  ("146","Deposit"),
  ("147","Dobbs Ferry"),
  ("148","Dolgeville"),
  ("149","Dover"),
  ("150","Downsville"),
  ("152","Dryden"),
  ("153","Duanesburg"),
  ("154","Dundee"),
  ("155","Dunkirk"),
  ("156","East Aurora"),
  ("157","Bloomfield"),
  ("158","East Greenbush"),
  ("159","East Hampton"),
  ("160","East Irondequoit"),
  ("161","East Islip"),
  ("162","East Meadow"),
  ("163","East Moriches"),
  ("164","East Quogue"),
  ("165","East Rochester"),
  ("166","East Rockaway"),
  ("167","East Syracuse-Minoa"),
  ("168","East Williston"),
  ("169","Eastchester"),
  ("170","Eastport-South Manor"),
  ("171","Eden"),
  ("172","Edgemont"),
  ("173","Edinburg"),
  ("174","Edmeston"),
  ("177","Elba"),
  ("178","Eldred"),
  ("179","Elizabethtown-Lewis"),
  ("180","Ellenville"),
  ("181","Ellicottville"),
  ("182","Elmira"),
  ("183","Elmira Heights"),
  ("184","Elmont"),
  ("185","Elmsford"),
  ("186","Elwood"),
  ("187","Fabius-Pompey"),
  ("188","Fairport"),
  ("189","Falconer"),
  ("190","Fallsburg"),
  ("191","Farmingdale"),
  ("192","Fillmore"),
  ("193","Fire Island"),
  ("194","Fishers Island"),
  ("195","Floral Park-Bellerose"),
  ("196","Florida"),
  ("197","Fonda-Fultonville"),
  ("198","Forestville"),
  ("199","Fort Ann"),
  ("200","Fort Edward"),
  ("201","Fort Plain"),
  ("202","Frankfort-Schuyler"),
  ("203","Franklin"),
  ("204","Franklin Square"),
  ("205","Ten Broeck Academy and Franklinville"),
  ("206","Fredonia"),
  ("207","Freeport"),
  ("208","Frewsburg"),
  ("209","Friendship"),
  ("210","Frontier"),
  ("211","Fulton"),
  ("212","Galway"),
  ("213","Gananda"),
  ("214","Garden City"),
  ("215","Garrison"),
  ("216","Gates Chili"),
  ("217","General Brown"),
  ("218","Geneseo"),
  ("219","Geneva"),
  ("221","Germantown"),
  ("222","Gilbertsville-Mount Upton"),
  ("223","Gilboa-Conesville"),
  ("224","Glen Cove"),
  ("225","Glens Falls"),
  ("226","Abraham Wing"),
  ("227","Gloversville"),
  ("228","Goshen"),
  ("229","Gouverneur"),
  ("230","Gowanda"),
  ("232","Grand Island"),
  ("233","Granville"),
  ("234","Great Neck"),
  ("235","Greece"),
  ("236","Green Island"),
  ("237","Greenburgh Central 7"),
  ("238","Greene"),
  ("239","Greenport"),
  ("240","Greenville"),
  ("241","Greenwich"),
  ("242","Canisteo-Greenwood"),
  ("243","Greenwood Lake"),
  ("244","Springville-Griffith Institute"),
  ("245","Groton"),
  ("246","Guilderland"),
  ("247","Hadley-Luzerne"),
  ("249","Haldane"),
  ("250","Half Hollow Hills"),
  ("251","Hamburg"),
  ("252","Hamilton"),
  ("253","Hammond"),
  ("254","Hammondsport"),
  ("255","Hampton Bays"),
  ("256","Hancock"),
  ("257","Hannibal"),
  ("258","Harborfields"),
  ("259","Harpursville"),
  ("260","Harrison"),
  ("261","Harrisville"),
  ("262","Hartford"),
  ("263","Hastings-on-Hudson"),
  ("264","Hauppauge"),
  ("265","Hempstead"),
  ("267","Hendrick Hudson"),
  ("268","Herkimer"),
  ("269","Hermon-DeKalb"),
  ("270","Herricks"),
  ("271","Heuvelton"),
  ("272","Hewlett-Woodmere"),
  ("273","Hicksville"),
  ("274","Highland"),
  ("275","Highland Falls-Fort Montgomery"),
  ("276","Hilton"),
  ("277","Hinsdale"),
  ("278","Holland"),
  ("279","Holland Patent"),
  ("280","Holley"),
  ("281","Homer"),
  ("282","Honeoye"),
  ("283","Honeoye Falls-Lima"),
  ("284","Hoosic Valley"),
  ("285","Hoosick Falls"),
  ("286","Hornell"),
  ("287","Horseheads"),
  ("288","Sackets Harbor"),
  ("289","Hudson"),
  ("290","Hudson Falls"),
  ("291","Hunter-Tannersville"),
  ("292","Huntington"),
  ("293","Hyde Park"),
  ("294","Ichabod Crane"),
  ("295","Ilion"),
  ("296","Indian Lake"),
  ("297","Indian River"),
  ("298","Inlet"),
  ("299","West Irondequoit"),
  ("300","Iroquois"),
  ("301","Irvington"),
  ("302","Island Park"),
  ("303","Island Trees"),
  ("304","Islip"),
  ("305","Ithaca"),
  ("306","Jamestown"),
  ("307","Jamesville-Dewitt"),
  ("308","Jasper-Troupsburg"),
  ("309","Sullivan West"),
  ("310","Jefferson"),
  ("311","Jericho"),
  ("312","Johnsburg"),
  ("313","Johnson City"),
  ("314","Johnstown"),
  ("315","Jordan-Elbridge"),
  ("316","Katonah-Lewisboro"),
  ("317","Keene"),
  ("318","Kendall"),
  ("319","Kenmore-Town of Tonawanda"),
  ("320","Dalton-Nunda (Keshequa)"),
  ("321","Kings Park"),
  ("322","Kingston"),
  ("324","LaFargeville"),
  ("325","LaFayette"),
  ("326","Lackawanna"),
  ("327","Lake George"),
  ("328","Lake Placid"),
  ("329","Lake Pleasant"),
  ("330","Lake Shore"),
  ("331","Lakeland"),
  ("332","Lancaster"),
  ("333","Lansing"),
  ("334","Lansingburgh"),
  ("335","Mattituck-Cutchogue"),
  ("336","Laurens"),
  ("337","Lawrence"),
  ("338","Le Roy"),
  ("339","Letchworth"),
  ("340","Levittown"),
  ("341","Lewiston-Porter"),
  ("342","Liberty"),
  ("344","Lindenhurst"),
  ("345","Lisbon"),
  ("346","Little Falls"),
  ("347","Cattaraugus-Little Valley"),
  ("348","Liverpool"),
  ("349","Livingston Manor"),
  ("350","Livonia"),
  ("351","Lockport"),
  ("352","Locust Valley"),
  ("353","Long Beach"),
  ("354","Long Lake"),
  ("355","Lowville Academy and Central"),
  ("356","Lyme"),
  ("357","Lynbrook"),
  ("358","Lyncourt"),
  ("359","Lyndonville"),
  ("360","Lyons"),
  ("361","Madison"),
  ("362","Madrid-Waddington"),
  ("363","Mahopac"),
  ("364","Maine-Endwell"),
  ("365","Malone"),
  ("366","Malverne"),
  ("367","Mamaroneck"),
  ("368","Manhasset"),
  ("369","Manhattan"),
  ("370","Fayetteville-Manlius"),
  ("371","North Colonie (including Maplewood)"),
  ("372","Marathon"),
  ("373","Marcellus"),
  ("374","Marcus Whitman"),
  ("375","Margaretville"),
  ("376","Marion"),
  ("377","Marlboro"),
  ("378","Maryvale"),
  ("379","Massapequa"),
  ("380","Massena"),
  ("381","William Floyd"),
  ("382","Mattituck-Cutchogue"),
  ("383","Mayfield"),
  ("385","McGraw"),
  ("386","Mechanicville"),
  ("387","Medina"),
  ("388","Menands"),
  ("389","Merrick"),
  ("390","Mexico Academy and Central"),
  ("391","Middle Country"),
  ("392","Longwood"),
  ("393","Middleburgh"),
  ("394","Middletown"),
  ("395","Milford"),
  ("396","Millbrook"),
  ("397","Miller Place"),
  ("398","Mineola"),
  ("399","Minerva"),
  ("400","Minisink Valley"),
  ("401","Mohawk"),
  ("402","Mohonasen"),
  ("403","Monroe-Woodbury"),
  ("404","Montauk"),
  ("405","Valley"),
  ("406","Monticello"),
  ("407","Moravia"),
  ("408","Moriah"),
  ("409","Morris"),
  ("410","Morristown"),
  ("411","Morrisville-Eaton"),
  ("412","Mount Markham"),
  ("413","Mount Morris"),
  ("414","Mount Sinai"),
  ("416","Mount Vernon"),
  ("417","Mount Pleasant"),
  ("418","Northeastern Clinton"),
  ("419","Nanuet"),
  ("420","Naples"),
  ("421","Sullivan West"),
  ("422","Unadilla Valley"),
  ("423","Clarkstown"),
  ("424","New Hartford"),
  ("425","New Hyde Park-Garden City Park"),
  ("426","New Lebanon"),
  ("427","New Paltz"),
  ("428","New Rochelle"),
  ("429","New Suffolk"),
  ("430","New York Mills"),
  ("431","Newark"),
  ("432","Newark Valley"),
  ("433","Newburgh"),
  ("434","Newcomb"),
  ("435","Newfane"),
  ("436","Newfield"),
  ("437","Niagara Falls"),
  ("438","Niagara Wheatfield"),
  ("439","Niskayuna"),
  ("440","North Babylon"),
  ("441","North Bellmore"),
  ("442","North Collins"),
  ("443","North Colonie (including Maplewood)"),
  ("444","North Merrick"),
  ("445","North Rockland"),
  ("446","North Rose-Wolcott"),
  ("447","North Salem"),
  ("448","North Shore"),
  ("449","North Syracuse"),
  ("450","North Tonawanda"),
  ("451","North Warren"),
  ("452","Northport-East Northport"),
  ("453","Northern Adirondack"),
  ("454","Northville"),
  ("455","Norwich"),
  ("456","Norwood-Norfolk"),
  ("457","Nyack"),
  ("458","Oakfield-Alabama"),
  ("459","Oceanside"),
  ("460","Odessa-Montour"),
  ("461","Ogdensburg"),
  ("462","Olean"),
  ("463","Oneida"),
  ("464","Oneonta"),
  ("465","Onondaga"),
  ("466","Onteora"),
  ("467","Oppenheim-Ephratah"),
  ("468","Orchard Park"),
  ("469","Oriskany"),
  ("471","Ossining"),
  ("472","Oswego"),
  ("473","Owego Apalachin"),
  ("474","Owen D. Young (Van Hornesville)"),
  ("475","Oxford Academy and Central"),
  ("476","Oyster Bay-East Norwich"),
  ("477","Oysterponds"),
  ("478","Palmyra-Macedon"),
  ("479","Panama"),
  ("480","Parishville-Hopkinton"),
  ("481","Patchogue-Medford"),
  ("482","Pavilion"),
  ("483","Pawling"),
  ("484","Pearl River"),
  ("485","Peekskill"),
  ("486","Pelham"),
  ("487","Pembroke"),
  ("488","Penfield"),
  ("489","Penn Yan"),
  ("490","Perry"),
  ("492","Peru"),
  ("493","Phelps-Clifton Springs (Midlakes)"),
  ("494","Phoenix"),
  ("495","Pine Bush"),
  ("496","Pine Plains"),
  ("497","Pine Valley"),
  ("498","Pioneer"),
  ("499","Piseco"),
  ("500","Pittsford"),
  ("501","Plainedge"),
  ("502","Plainview-Old Bethpage"),
  ("503","Plattsburgh"),
  ("504","Pleasantville"),
  ("505","Pocantico Hills"),
  ("506","Poland"),
  ("507","Port Byron"),
  ("508","Port Chester"),
  ("509","Port Jefferson"),
  ("510","Port Jervis"),
  ("511","Port Washington"),
  ("512","Portville"),
  ("513","Potsdam"),
  ("514","Poughkeepsie"),
  ("515","Prattsburg"),
  ("516","Pulaski Academy and Central"),
  ("517","Putnam"),
  ("518","Putnam Valley"),
  ("519","Queens"),
  ("520","Queensbury"),
  ("521","Quogue"),
  ("522","Randolph"),
  ("523","Raquette Lake"),
  ("524","Ravena-Coeymans-Selkirk"),
  ("525","Red Creek"),
  ("526","Red Hook"),
  ("527","Manchester-Shortsville (Red Jacket)"),
  ("528","Remsen"),
  ("529","Remsenburg-Speonk"),
  ("530","Rensselaer"),
  ("531","Rhinebeck"),
  ("533","Richfield Springs"),
  ("535","Blind Brook"),
  ("536","Ripley"),
  ("537","Riverhead"),
  ("538","Rochester"),
  ("539","Rockville Centre"),
  ("540","Rocky Point"),
  ("541","Rome"),
  ("542","Romulus"),
  ("543","Rondout Valley"),
  ("544","Roosevelt"),
  ("545","Roscoe"),
  ("546","Roslyn"),
  ("547","Roxbury"),
  ("548","Royalton-Hartland"),
  ("549","Rush-Henrietta"),
  ("551","Rye"),
  ("552","Rye Neck"),
  ("553","Sachem"),
  ("554","Sag Harbor"),
  ("555","Sagaponack"),
  ("556","Salamanca"),
  ("557","Salem"),
  ("558","Salmon River"),
  ("559","Sandy Creek"),
  ("560","Saranac"),
  ("561","Saranac Lake"),
  ("562","Saratoga Springs"),
  ("563","Saugerties"),
  ("564","Sauquoit Valley"),
  ("566","Sayville"),
  ("567","Scarsdale"),
  ("568","Schalmont"),
  ("569","Schenectady"),
  ("570","Schenevus"),
  ("571","Schodack"),
  ("572","Schoharie"),
  ("573","Schroon Lake"),
  ("574","Schuylerville"),
  ("575","Scio"),
  ("576","Scotia-Glenville"),
  ("577","Seaford"),
  ("578","Seneca Falls"),
  ("579","Sharon Springs"),
  ("580","Shelter Island"),
  ("581","Shenendehowa"),
  ("582","Sherburne-Earlville"),
  ("583","Sherman"),
  ("584","Vernon-Verona-Sherrill"),
  ("585","Shoreham-Wading River"),
  ("586","Sidney"),
  ("587","Silver Creek"),
  ("588","Skaneateles"),
  ("589","Cheektowaga-Sloan"),
  ("590","Smithtown"),
  ("592","Sodus"),
  ("593","Solvay"),
  ("594","Somers"),
  ("595","South Colonie"),
  ("596","South Country"),
  ("597","South Glens Falls"),
  ("599","South Huntington"),
  ("600","South Jefferson"),
  ("601","South Kortright"),
  ("602","South Lewis"),
  ("603","Eastport-South Manor"),
  ("605","South Orangetown"),
  ("606","Otselic Valley"),
  ("607","South Seneca"),
  ("608","Southampton"),
  ("609","Southern Cayuga"),
  ("610","Southold"),
  ("611","Southwestern"),
  ("612","Spackenkill"),
  ("613","Spencer-Van Etten"),
  ("614","Spencerport"),
  ("615","East Ramapo"),
  ("616","Cherry Valley-Springfield"),
  ("617","Springs"),
  ("618","Saint Johnsville"),
  ("619","St. Regis Falls"),
  ("620","Stamford"),
  ("621","Starpoint"),
  ("622","Staten Island"),
  ("623","Stillwater"),
  ("624","Stockbridge Valley"),
  ("626","Ramapo"),
  ("627","Susquehanna Valley"),
  ("628","Sweet Home"),
  ("629","Oneida"),
  ("630","Syosset"),
  ("631","Syracuse"),
  ("632","Taconic Hills"),
  ("633","Tarrytowns"),
  ("634","Thousand Islands"),
  ("635","Three Village"),
  ("636","Ticonderoga"),
  ("637","Tioga"),
  ("638","Tonawanda City"),
  ("639","Town of Webb"),
  ("640","Tri-Valley"),
  ("642","Troy"),
  ("643","Trumansburg"),
  ("644","Tuckahoe Union Free"),
  ("645","Tuckahoe Common"),
  ("646","Tully"),
  ("647","Tupper Lake"),
  ("648","Tuxedo"),
  ("649","Unatego"),
  ("650","Union Springs"),
  ("651","Union-Endicott"),
  ("652","Uniondale"),
  ("653","Utica"),
  ("654","Valhalla"),
  ("655","Valley Stream 13"),
  ("656","Valley Stream 24"),
  ("657","Valley Stream 30"),
  ("658","Vestal"),
  ("659","Victor"),
  ("660","Voorheesville"),
  ("661","Wainscott"),
  ("662","Wallkill"),
  ("663","Walton"),
  ("664","Wantagh"),
  ("665","Wappingers"),
  ("666","Warrensburg"),
  ("667","Warsaw"),
  ("668","Warwick Valley"),
  ("669","Washingtonville"),
  ("670","Waterford-Halfmoon"),
  ("671","Waterloo"),
  ("672","Watertown"),
  ("673","Waterville"),
  ("674","Watervliet"),
  ("675","Watkins Glen"),
  ("676","Waverly"),
  ("677","Wayland-Cohocton"),
  ("678","Wayne"),
  ("679","Webster"),
  ("680","Webutuck"),
  ("681","Weedsport"),
  ("682","Wells"),
  ("683","Wellsville"),
  ("684","West Babylon"),
  ("685","West Canada Valley"),
  ("686","West Genesee"),
  ("687","West Hempstead"),
  ("688","West Islip"),
  ("689","West Seneca"),
  ("690","West Valley"),
  ("691","Westbury"),
  ("692","Westfield Academy and Central"),
  ("693","Westhampton Beach"),
  ("694","Westhill"),
  ("695","Westmoreland"),
  ("696","Westport"),
  ("697","Wheatland-Chili"),
  ("698","Wheelerville"),
  ("699","White Plains"),
  ("700","Whitehall"),
  ("701","Whitesboro"),
  ("702","Whitesville"),
  ("703","Whitney Point"),
  ("704","North Greenbush (Williams)"),
  ("705","Williamson"),
  ("706","Williamsville"),
  ("707","Willsboro"),
  ("708","Wilson"),
  ("709","Windham-Ashland-Jewett"),
  ("710","Windsor"),
  ("711","Worcester"),
  ("712","Wyandanch"),
  ("713","Wynantskill"),
  ("714","Wyoming"),
  ("715","Yonkers"),
  ("716","York"),
  ("717","Yorktown"),
  ("719","Amherst"),
  ("720","South Mountain-Hickory"),
  ("724","Edwards-Knox"),
  ("725","Kiryas Joel Village");
