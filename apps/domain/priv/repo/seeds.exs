# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Domain.Repo.insert!(%Domain.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

Domain.Repo.insert!(%Domain.Projects.Assay{
  name: "Access"
})

statuses = ["success", "failure", "running"]

Enum.map(1..60, fn id ->
  Domain.Projects.create_job_with_workflows(%{
    "group_id" => UUID.uuid4(),
    "sample_id" => id,
    "workflows" => %{
      "name" => "Beagle Initiated",
      "status" => "success",
      "children" => [
        %{
          "name" => "FASTQ to BAM",
          "status" => "success",
          "children" => [
            %{
              "name" => "MSI",
              "status" => Enum.random(statuses),
              "children" => []
            },
            %{
              "name" => "Call variants",
              "status" => Enum.random(statuses),
              "children" => []
            },
            %{
              "name" => "Manta",
              "status" => Enum.random(statuses),
              "children" => [
                %{
                  "name" => "Call variants",
                  "status" => "pending",
                  "children" => []
                }
              ]
            }
          ]
        }
      ]
    }
  })
end)
