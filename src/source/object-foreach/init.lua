return function (t, callback)
	for i, v in t do
		callback(i, v)
	end
end