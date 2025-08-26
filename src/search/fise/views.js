const views = {
  resultViews: [
    {
      id: 'fiseCardItem',
      title: 'Fise catalogue items',
      icon: 'bars',
      render: null,
      isDefault: true,
      factories: {
        view: 'HorizontalCard.Group',
        item: 'FiseCardItem',
      },
    },
  ],
};

export default views;
