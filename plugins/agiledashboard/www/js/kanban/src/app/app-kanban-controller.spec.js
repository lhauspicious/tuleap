describe('KanbanCtrl - ', function() {
    var $rootScope,
        $scope,
        $controller,
        $q,
        KanbanCtrl,
        SharedPropertiesService,
        KanbanService,
        KanbanColumnService,
        KanbanItemRestService,
        NewTuleapArtifactModalService,
        SocketService,
        DroppedService,
        ColumnCollectionService,
        KanbanFilterValue,
        kanban;

    function emptyArray(array) {
        array.length = 0;
    }

    beforeEach(function() {
        module('kanban');

        inject(function(
            _$controller_,
            _$q_,
            _$rootScope_,
            _KanbanItemRestService_,
            _KanbanService_,
            _NewTuleapArtifactModalService_,
            _SharedPropertiesService_,
            _KanbanColumnService_,
            _SocketService_,
            _DroppedService_,
            _ColumnCollectionService_,
            _KanbanFilterValue_
        ) {
            $controller                   = _$controller_;
            $q                            = _$q_;
            $rootScope                    = _$rootScope_;
            KanbanColumnService           = _KanbanColumnService_;
            KanbanItemRestService         = _KanbanItemRestService_;
            KanbanService                 = _KanbanService_;
            NewTuleapArtifactModalService = _NewTuleapArtifactModalService_;
            SharedPropertiesService       = _SharedPropertiesService_;
            SocketService                 = _SocketService_;
            DroppedService                = _DroppedService_;
            ColumnCollectionService       = _ColumnCollectionService_;
            KanbanFilterValue             = _KanbanFilterValue_;
        });

        kanban = {
            id     : 38,
            label  : '',
            archive: {},
            backlog: {},
            columns: [
                { id: 230 },
                { id: 530 }
            ],
            tracker_id: 56
        };

        spyOn(SharedPropertiesService, "getKanban").and.returnValue(kanban);

        spyOn(KanbanService, 'getBacklog').and.returnValue($q.defer().promise);
        spyOn(KanbanService, 'getBacklogSize').and.returnValue($q.defer().promise);
        spyOn(KanbanService, 'getArchive').and.returnValue($q.defer().promise);
        spyOn(KanbanService, 'getArchiveSize').and.returnValue($q.defer().promise);
        spyOn(KanbanService, 'getColumnContentSize').and.returnValue($q.defer().promise);

        spyOn(KanbanColumnService, "filterItems");
        spyOn(KanbanColumnService, "moveItem");
        spyOn(DroppedService, "getComparedTo");
        spyOn(DroppedService, "getComparedToBeFirstItemOfColumn");
        spyOn(DroppedService, "getComparedToBeLastItemOfColumn");
        spyOn(DroppedService, "reorderColumn").and.returnValue($q.when());
        spyOn(DroppedService, "moveToColumn").and.returnValue($q.when());
        spyOn(ColumnCollectionService, "getColumn");

        KanbanFilterValue = {
            terms: ''
        };

        $scope = $rootScope.$new();

        KanbanCtrl = $controller('KanbanCtrl', {
            $scope                       : $scope,
            $q                           : $q,
            SharedPropertiesService      : SharedPropertiesService,
            KanbanService                : KanbanService,
            KanbanItemRestService        : KanbanItemRestService,
            NewTuleapArtifactModalService: NewTuleapArtifactModalService,
            KanbanColumnService          : KanbanColumnService,
            SocketService                : SocketService,
            ColumnCollectionService      : ColumnCollectionService
        });

        installPromiseMatchers();
    });

    describe("init() -", function() {
        describe("loadArchive() -", function() {
            it("Given that the archive column was open, when I load it, then its content will be loaded and filtered", function() {
                KanbanCtrl.archive.is_open = true;
                var get_archive_request    = $q.defer();
                KanbanService.getArchive.and.returnValue(get_archive_request.promise);

                KanbanCtrl.init();

                expect(KanbanCtrl.archive.loading_items).toBeTruthy();
                expect(KanbanService.getArchive).toHaveBeenCalledWith(kanban.id, 50, 0);

                get_archive_request.resolve({
                    results: [
                        { id: 88 },
                        { id: 40 }
                    ]
                });
                $scope.$apply();

                expect(KanbanCtrl.archive.content).toEqual([
                    { id: 88 },
                    { id: 40 }
                ]);
                expect(KanbanColumnService.filterItems).toHaveBeenCalledWith(KanbanCtrl.archive);
                expect(KanbanCtrl.archive.loading_items).toBeFalsy();
                expect(KanbanCtrl.archive.fully_loaded).toBeTruthy();
            });

            it("Given that the archive column was closed, when I load it, then only its total number of items will be loaded", function() {
                var get_archive_size_request = $q.defer();
                KanbanService.getArchiveSize.and.returnValue(get_archive_size_request.promise);

                KanbanCtrl.archive.is_open = false;

                KanbanCtrl.init();
                get_archive_size_request.resolve(6);
                $scope.$apply();

                expect(KanbanColumnService.filterItems).not.toHaveBeenCalled();
                expect(KanbanService.getArchiveSize).toHaveBeenCalledWith(kanban.id);
                expect(KanbanCtrl.archive.loading_items).toBeFalsy();
                expect(KanbanCtrl.archive.nb_items_at_kanban_init).toEqual(6);
            });
        });

        describe("loadBacklog() -", function() {
            it("Given that the backlog column was open, when I load it, then its content will be loaded", function() {
                KanbanCtrl.backlog.is_open = true;
                var get_backlog_request    = $q.defer();
                KanbanService.getBacklog.and.returnValue(get_backlog_request.promise);

                KanbanCtrl.init();

                expect(KanbanCtrl.backlog.loading_items).toBeTruthy();
                expect(KanbanService.getBacklog).toHaveBeenCalledWith(kanban.id, 50, 0);

                get_backlog_request.resolve({
                    results: [
                        { id: 69 },
                        { id: 16 }
                    ]
                });
                $scope.$apply();

                expect(KanbanCtrl.backlog.content).toEqual([
                    { id: 69 },
                    { id: 16 }
                ]);
                expect(KanbanColumnService.filterItems).toHaveBeenCalledWith(KanbanCtrl.backlog);
                expect(KanbanCtrl.backlog.loading_items).toBeFalsy();
                expect(KanbanCtrl.backlog.fully_loaded).toBeTruthy();
            });

            it("Given that the backlog column was closed, when I load it, then only its total number of items will be loaded", function() {
                var get_backlog_size_request = $q.defer();
                KanbanService.getBacklogSize.and.returnValue(get_backlog_size_request.promise);

                KanbanCtrl.backlog.is_open = false;

                KanbanCtrl.init();
                get_backlog_size_request.resolve(28);
                $scope.$apply();

                expect(KanbanColumnService.filterItems).not.toHaveBeenCalled();
                expect(KanbanService.getBacklogSize).toHaveBeenCalledWith(kanban.id);
                expect(KanbanCtrl.backlog.loading_items).toBeFalsy();
                expect(KanbanCtrl.backlog.nb_items_at_kanban_init).toEqual(28);
            });
        });

        describe("loadColumns() -", function() {
            it("Given a kanban column that was open, when I load it, then its content will be loaded", function() {
                var get_column_request = $q.defer();
                spyOn(KanbanService, 'getItems').and.returnValue(get_column_request.promise);
                kanban.columns    = [];
                kanban.columns[0] = {
                    id     : 10,
                    label  : 'palate',
                    limit  : 7,
                    is_open: true
                };

                KanbanCtrl.init();

                var column = kanban.columns[0];
                expect(column.content).toEqual([]);
                expect(column.filtered_content).toEqual([]);
                expect(column.filtered_content).not.toBe(column.content);
                expect(column.loading_items).toBeTruthy();
                expect(column.nb_items_at_kanban_init).toEqual(0);
                expect(column.fully_loaded).toBeFalsy();
                expect(column.resize_left).toEqual('');
                expect(column.resize_top).toEqual('');
                expect(column.resize_width).toEqual('');
                expect(column.wip_in_edit).toBeFalsy();
                expect(column.limit_input).toEqual(7);
                expect(column.saving_wip).toBeFalsy();
                expect(column.is_small_width).toBeFalsy();
                expect(column.is_defered).toBeFalsy();
                expect(column.original_label).toEqual('palate');

                expect(KanbanService.getItems).toHaveBeenCalledWith(kanban.id, column.id, 50, 0);
                get_column_request.resolve({
                    results: [
                        { id: 981 },
                        { id: 331 }
                    ]
                });
                $scope.$apply();

                expect(column.content).toEqual([
                    { id: 981 },
                    { id: 331 }
                ]);
                expect(KanbanColumnService.filterItems).toHaveBeenCalledWith(column);
                expect(column.loading_items).toBeFalsy();
                expect(column.fully_loaded).toBeTruthy();
            });

            it("Given a kanban column that was closed, when I load it, then only its total number of items will be loaded", function() {
                var get_column_size_request = $q.defer();
                KanbanService.getColumnContentSize.and.returnValue(get_column_size_request.promise);
                kanban.columns    = [];
                kanban.columns[0] = {
                    id     : 75,
                    label  : 'undisfranchised',
                    limit  : 21,
                    is_open: false
                };

                KanbanCtrl.init();

                var column = kanban.columns[0];
                expect(column.content).toEqual([]);
                expect(column.filtered_content).toEqual([]);
                expect(column.filtered_content).not.toBe(column.content);
                expect(column.loading_items).toBeTruthy();
                expect(column.nb_items_at_kanban_init).toEqual(0);
                expect(column.fully_loaded).toBeFalsy();
                expect(column.resize_left).toEqual('');
                expect(column.resize_top).toEqual('');
                expect(column.resize_width).toEqual('');
                expect(column.wip_in_edit).toBeFalsy();
                expect(column.limit_input).toEqual(21);
                expect(column.saving_wip).toBeFalsy();
                expect(column.is_small_width).toBeFalsy();
                expect(column.is_defered).toBeTruthy();
                expect(column.original_label).toEqual('undisfranchised');

                KanbanCtrl.init();
                get_column_size_request.resolve(42);
                $scope.$apply();

                expect(KanbanColumnService.filterItems).not.toHaveBeenCalled();
                expect(KanbanService.getColumnContentSize).toHaveBeenCalledWith(kanban.id, column.id);
                expect(column.loading_items).toBeFalsy();
                expect(column.nb_items_at_kanban_init).toEqual(42);
            });
        });
    });

    describe("toggleArchive() -", function() {
        it("Given that the archive column was open, when I toggle it, then it will be collapsed and its filtered content will be emptied", function() {
            spyOn(KanbanService, "collapseArchive");
            KanbanCtrl.archive.is_open          = true;
            KanbanCtrl.archive.filtered_content = [
                { id: 82 }
            ];

            KanbanCtrl.toggleArchive();

            expect(KanbanCtrl.archive.filtered_content).toEqual([]);
            expect(KanbanService.collapseArchive).toHaveBeenCalledWith(kanban.id);
            expect(KanbanCtrl.archive.is_open).toBeFalsy();
        });

        describe("Given that the archive column was closed", function() {
            beforeEach(function() {
                KanbanCtrl.archive.is_open = false;
            });

            it("and fully loaded, when I toggle it, then it will be expanded and filtered", function() {
                spyOn(KanbanService, "expandArchive");
                KanbanCtrl.archive.fully_loaded = true;
                KanbanCtrl.archive.content      = [
                    { id: 36 }
                ];

                KanbanCtrl.toggleArchive();

                expect(KanbanService.expandArchive).toHaveBeenCalledWith(kanban.id);
                expect(KanbanCtrl.archive.is_open).toBeTruthy();
                expect(KanbanColumnService.filterItems).toHaveBeenCalledWith(KanbanCtrl.archive);
            });

            it("and not yet loaded, when I toggle it, then it will be expanded and loaded", function() {
                KanbanCtrl.archive.fully_loaded = false;

                KanbanCtrl.toggleArchive();

                expect(KanbanService.getArchive).toHaveBeenCalled();
            });
        });
    });

    describe("toggleBacklog() -", function() {
        it("Given that the backlog column was open, when I toggle it, then it will be collapsed and its filtered content will be emptied", function() {
            spyOn(KanbanService, "collapseBacklog");
            KanbanCtrl.backlog.is_open = true;
            KanbanCtrl.backlog.filtered_content = [
                { id: 70 }
            ];

            KanbanCtrl.toggleBacklog();

            expect(KanbanCtrl.backlog.filtered_content).toEqual([]);
            expect(KanbanService.collapseBacklog).toHaveBeenCalledWith(kanban.id);
            expect(KanbanCtrl.backlog.is_open).toBeFalsy();
        });

        describe("Given that the backlog column was closed", function() {
            beforeEach(function() {
                KanbanCtrl.backlog.is_open = false;
            });

            it("and fully loaded, when I toggle it, then it will be expanded and filtered", function() {
                spyOn(KanbanService, "expandBacklog");
                KanbanCtrl.backlog.fully_loaded = true;
                KanbanCtrl.backlog.content      = [
                    { id: 80 }
                ];

                KanbanCtrl.toggleBacklog();

                expect(KanbanService.expandBacklog).toHaveBeenCalledWith(kanban.id);
                expect(KanbanCtrl.backlog.is_open).toBeTruthy();
                expect(KanbanColumnService.filterItems).toHaveBeenCalledWith(KanbanCtrl.backlog);
            });

            it("and not yet loaded, when I toggle it, then it will be expanded and loaded", function() {
                KanbanCtrl.backlog.fully_loaded = false;

                KanbanCtrl.toggleBacklog();

                expect(KanbanService.getBacklog).toHaveBeenCalled();
            });
        });
    });

    describe("toggleColumn() -", function() {
        it("Given a kanban column that was open, when I toggle it, then it will be collapsed and its filtered content will be emptied", function() {
            spyOn(KanbanService, "collapseColumn");
            var column = {
                id              : 22,
                is_open         : true,
                filtered_content: [
                    { id: 25 }
                ]
            };

            KanbanCtrl.toggleColumn(column);

            expect(column.filtered_content).toEqual([]);
            expect(KanbanService.collapseColumn).toHaveBeenCalledWith(kanban.id, column.id);
            expect(column.is_open).toBeFalsy();
        });

        describe("Given a kanban column that was closed", function() {
            var column;
            beforeEach(function() {
                column = {
                    id     : 69,
                    is_open: false
                };
            });

            it("and fully loaded, when I toggle it, then it will be expanded and filtered", function() {
                spyOn(KanbanService, "expandColumn");
                column.fully_loaded = true;
                column.content      = [
                    { id: 81 }
                ];

                KanbanCtrl.toggleColumn(column);

                expect(KanbanService.expandColumn).toHaveBeenCalledWith(kanban.id, column.id);
                expect(column.is_open).toBeTruthy();
                expect(KanbanColumnService.filterItems).toHaveBeenCalledWith(column);
            });
        });
    });

    describe("createItemInPlace() -", function() {
        it("Given a label and a kanban column, when I create a new kanban item, then it will be created using KanbanItemRestService and will be appended to the given column", function() {
            var create_item_request = $q.defer();
            spyOn(SharedPropertiesService, "doesUserPrefersCompactCards").and.returnValue(true);
            spyOn(KanbanItemRestService, "createItem").and.returnValue(create_item_request.promise);
            var column = {
                id     : 5,
                content: [
                    { id: 97 },
                    { id: 69 }
                ],
                filtered_content: [
                    { id: 69 }
                ]
            };

            KanbanCtrl.createItemInPlace('photothermic', column);
            expect(column.content).toEqual([
                { id: 97 },
                { id: 69 },
                {
                    label       : 'photothermic',
                    updating    : true,
                    is_collapsed: true
                }
            ]);
            expect(column.filtered_content).toEqual([
                { id: 69 },
                {
                    label       : 'photothermic',
                    updating    : true,
                    is_collapsed: true
                }
            ]);
            expect(column.filtered_content).not.toBe(column.content);

            create_item_request.resolve({
                id   : 94,
                label: 'photothermic'
            });
            $scope.$apply();

            expect(column.content[2].updating).toBeFalsy();
            expect(KanbanItemRestService.createItem).toHaveBeenCalledWith(kanban.id, column.id, 'photothermic');
        });
    });

    describe("createItemInPlaceInBacklog() -", function() {
        it("Given a label, when I create a new kanban item in the backlog, then it will be created using KanbanItemRestService and will be appended to the backlog", function() {
            var create_item_request = $q.defer();
            spyOn(SharedPropertiesService, "doesUserPrefersCompactCards").and.returnValue(true);
            spyOn(KanbanItemRestService, "createItemInBacklog").and.returnValue(create_item_request.promise);
            KanbanCtrl.backlog.content = [
                { id: 91 },
                { id: 85 }
            ];
            KanbanCtrl.backlog.filtered_content = [
                { id: 91 }
            ];

            KanbanCtrl.createItemInPlaceInBacklog('unbeautifully');
            expect(KanbanCtrl.backlog.content).toEqual([
                { id: 91 },
                { id: 85 },
                {
                    label       : 'unbeautifully',
                    updating    : true,
                    is_collapsed: true
                }
            ]);
            expect(KanbanCtrl.backlog.filtered_content).toEqual([
                { id: 91 },
                {
                    label       : 'unbeautifully',
                    updating    : true,
                    is_collapsed: true
                }
            ]);
            expect(KanbanCtrl.backlog.filtered_content).not.toBe(KanbanCtrl.backlog.content);

            create_item_request.resolve({
                id   : 11,
                label: 'unbeautifully'
            });
            $scope.$apply();

            expect(KanbanCtrl.backlog.content[2].updating).toBeFalsy();
            expect(KanbanItemRestService.createItemInBacklog).toHaveBeenCalledWith(kanban.id, 'unbeautifully');
        });
    });

    describe("filterCards() -", function() {
        describe("Given that the backlog column", function() {
            it("was open, when I filter the kanban, then the backlog will be filtered", function() {
                KanbanCtrl.backlog.is_open = true;

                KanbanCtrl.filterCards();

                expect(KanbanColumnService.filterItems).toHaveBeenCalledWith(KanbanCtrl.backlog);
            });

            it("was closed, when I filter the kanban, then the backlog won't be filtered", function() {
                KanbanCtrl.backlog.is_open = false;

                KanbanCtrl.filterCards();

                expect(KanbanColumnService.filterItems).not.toHaveBeenCalled();
            });
        });

        describe("Given that the archive column", function() {
            it("was open, when I filter the kanban, then the archive will be filtered", function() {
                KanbanCtrl.archive.is_open = true;

                KanbanCtrl.filterCards();

                expect(KanbanColumnService.filterItems).toHaveBeenCalledWith(KanbanCtrl.archive);
            });

            it("was closed, when I filter the kanban, then the archive won't be filtered", function() {
                KanbanCtrl.archive.is_open = false;

                KanbanCtrl.filterCards();

                expect(KanbanColumnService.filterItems).not.toHaveBeenCalled();
            });
        });

        describe("Given a kanban column", function() {
            var column;

            beforeEach(function() {
                emptyArray(kanban.columns);
                column = {
                    id     : 8,
                    content: [
                        { id: 49 },
                        { id: 27 }
                    ],
                    filtered_content: [
                        { id: 49 },
                        { id: 27 }
                    ]
                };
                kanban.columns[0] = column;
            });

            it("that was open, when I filter the kanban, then the column will be filtered", function() {
                column.is_open = true;

                KanbanCtrl.filterCards();

                expect(KanbanColumnService.filterItems).toHaveBeenCalledWith(column);
            });

            it("that was closed, when I filter the kanban, then the column won't be filtered", function() {
                column.is_open = false;

                KanbanCtrl.filterCards();

                expect(KanbanColumnService.filterItems).not.toHaveBeenCalled();
            });
        });
    });

    describe("showEditModal() -", function() {
        var fake_event;
        beforeEach(function() {
            spyOn(NewTuleapArtifactModalService, 'showEdition');
            spyOn(SharedPropertiesService, 'getUserId').and.returnValue(102);
            fake_event = {
                which: 1,
                preventDefault: jasmine.createSpy("preventDefault")
            };
        });

        it("Given a left mouse click event, when I show the edition modal, then the default event will be prevented", function() {
            KanbanCtrl.showEditModal(fake_event, {
                id: 55,
                color: 'infaust'
            });

            expect(fake_event.preventDefault).toHaveBeenCalled();
        });

        it("Given an item, when I show the edition modal, then the Tuleap Artifact Modal service will be called", function() {
            KanbanCtrl.showEditModal(fake_event, {
                id: 4288,
                color: 'Indianhood'
            });

            expect(NewTuleapArtifactModalService.showEdition).toHaveBeenCalledWith(102, 56, 4288, jasmine.any(Function));
        });

        describe("callback -", function() {
            var fake_updated_item;
            var get_request;

            beforeEach(function() {
                NewTuleapArtifactModalService.showEdition.and.callFake(function(c, a, b, callback) {
                    callback();
                });
                get_request = $q.defer();
                spyOn(KanbanItemRestService, 'getItem').and.returnValue(get_request.promise);
                spyOn(KanbanCtrl, "moveItemAtTheEnd");

                var archive = {
                    id: 'archive'
                };
                var column = {
                    id: 252
                };
                ColumnCollectionService.getColumn.and.callFake(function(column_id) {
                    if (column_id === 'archive') {
                        return archive;
                    }

                    return column;
                });

                fake_updated_item = {
                    id: 108,
                    color: 'relapse',
                    card_fields: [
                        {
                            field_id: 27,
                            type: 'string',
                            label: 'title',
                            value: 'omnigenous'
                        }
                    ],
                    in_column: 'archive',
                    label: 'omnigenous'
                };
            });

            it("Given an item and given I changed its column during edition, when the new artifact modal calls its callback, then the kanban-item service will be called, the item will be refreshed with the new values and it will be moved at the end of its new column", function() {
                KanbanCtrl.showEditModal(fake_event, {
                    id: 108,
                    color: 'nainsel',
                    in_column: 252,
                    timeinfo: {}
                });
                get_request.resolve(fake_updated_item);
                $scope.$apply();

                // It should be called with the object returned by KanbanItemRestService (the one with color: 'nainsel' )
                // but jasmine (at least in version 1.3) seems to only register the object ref and not
                // make a deep copy of it, so when we update the object later with _.extend, it biases the test...
                // see https://github.com/jasmine/jasmine/issues/872
                // I'd rather have an imprecise test than a misleading one, so I used jasmine.any(Object)
                expect(KanbanCtrl.moveItemAtTheEnd).toHaveBeenCalledWith(
                    jasmine.any(Object),
                    'archive'
                );
            });

            it("Given an item and given that I did not change its column during edition, when the new artifact modal calls its callback, then the item will not be moved at the end of its new column", function() {
                KanbanCtrl.showEditModal(fake_event, {
                    id: 108,
                    color: 'unpracticably',
                    in_column: 'archive',
                    timeinfo: {}
                });
                get_request.resolve(fake_updated_item);
                $scope.$apply();

                expect(KanbanCtrl.moveItemAtTheEnd).not.toHaveBeenCalled();
            });
        });
    });

    describe("moveItemAtTheEnd() -", function() {
        it("Given a kanban item in a column and another kanban column, when I move the item to the column, then the item will be marked as updating, will be removed from the previous column's content, will be appended to the given column's content, the REST backend will be called to move the item in the new column and a resolved promise will be returned", function() {
            var move_request = $q.defer();
            DroppedService.moveToColumn.and.returnValue(move_request.promise);
            var item =  {
                id       : 19,
                updating : false,
                in_column: 3
            };
            var source_column = {
                id: 3,
            };
            var destination_column = {
                id: 6,
            };
            ColumnCollectionService.getColumn.and.callFake(function(column_id) {
                if (column_id === 3) {
                    return source_column;
                }

                return destination_column;
            });
            DroppedService.getComparedToBeLastItemOfColumn.and.returnValue(null);

            var promise = KanbanCtrl.moveItemAtTheEnd(item, destination_column.id, item.in_column);

            expect(item.updating).toBeTruthy();

            move_request.resolve();
            $scope.$apply();

            expect(item.updating).toBeFalsy();
            expect(DroppedService.moveToColumn).toHaveBeenCalledWith(
                kanban.id,
                6,
                item.id,
                null,
                3
            );
            expect(promise).toBeResolved();
        });
    });

    describe("moveKanbanItemToTop() -", function() {
        it("Given an item, when I move it to the top, then it will be moved to the top of its column", function() {
            var item = {
                id       : 39,
                in_column: 9
            };

            var column = {
                id: 95
            };
            ColumnCollectionService.getColumn.and.returnValue(column);
            var compared_to = {
                direction: 'before',
                item_id  : 44
            };
            DroppedService.getComparedToBeFirstItemOfColumn.and.returnValue(compared_to);

            KanbanCtrl.moveKanbanItemToTop(item);

            expect(KanbanColumnService.moveItem).toHaveBeenCalledWith(
                item,
                column,
                column,
                compared_to
            );
            expect(DroppedService.reorderColumn).toHaveBeenCalledWith(
                kanban.id,
                column.id,
                item.id,
                compared_to
            );
        });
    });

    describe("moveKanbanItemToBottom() -", function() {
        it("Given an item, when I move it to the bottom, then it will be moved to the bottom of its column", function() {
            var item = {
                id       : 74,
                in_column: 'archive'
            };

            var archive = {
                id: 'archive'
            };
            ColumnCollectionService.getColumn.and.returnValue(archive);
            var compared_to = {
                direction: 'after',
                item_id  : 10
            };
            DroppedService.getComparedToBeLastItemOfColumn.and.returnValue(compared_to);

            KanbanCtrl.moveKanbanItemToBottom(item);

            expect(KanbanColumnService.moveItem).toHaveBeenCalledWith(
                item,
                archive,
                archive,
                compared_to
            );
            expect(DroppedService.reorderColumn).toHaveBeenCalledWith(
                kanban.id,
                'archive',
                item.id,
                compared_to
            );
        });
    });
});
